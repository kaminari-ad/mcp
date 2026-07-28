import { describe, expect, it } from "vitest";

import { createCustomRuleTool } from "../../../../src/application/tools/custom-rules/create-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createCustomRuleTool", () => {
  it("name + validates name length", () => {
    expect(createCustomRuleTool.name).toBe("create_custom_rule");
    expect(() =>
      createCustomRuleTool.inputSchema.parse({
        name: "",
        rule_type: "regexp_content",
        config: {},
      })
    ).toThrow();
  });

  it("forwards body and omits absent optionals", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCustomRuleTool.handler(
      {
        name: "RX",
        rule_type: "regexp_content",
        config: { pattern: "viagra" },
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCustomRule") throw new Error("wrong");
    expect(call.body.name).toBe("RX");
    expect(call.body.tag_slug).toBeUndefined();
    expect(call.body.target).toBeUndefined();
  });

  it("accepts both combo match_scope values and forwards config verbatim", async () => {
    for (const match_scope of ["scan", "url"]) {
      expect(
        createCustomRuleTool.inputSchema.safeParse({
          name: "AV consensus",
          rule_type: "combo",
          config: { match_scope, tag_category: "antivirus", count_gte: 5 },
        }).success
      ).toBe(true);
    }
    const api = createFakeApiGateway();
    await createCustomRuleTool.handler(
      {
        name: "AV consensus",
        rule_type: "combo",
        config: { match_scope: "url", tag_category: "antivirus", count_gte: 5 },
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCustomRule") throw new Error("wrong");
    expect(call.body.config).toEqual({
      match_scope: "url",
      tag_category: "antivirus",
      count_gte: 5,
    });
  });

  it("rejects an unknown combo match_scope before the gateway is called", () => {
    // The API rejects this too; failing locally turns an upstream 422
    // into an input error naming the key and its two legal values.
    for (const match_scope of ["per_url", "URL", 1]) {
      const parsed = createCustomRuleTool.inputSchema.safeParse({
        name: "AV consensus",
        rule_type: "combo",
        config: { match_scope, tag_category: "antivirus", count_gte: 5 },
      });
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.path).toEqual(["config", "match_scope"]);
        expect(parsed.error.issues[0]?.message).toContain('"scan" or "url"');
      }
    }
  });

  it("documents the match_scope default and the per-link caveats in the config description", () => {
    const description = createCustomRuleTool.inputSchema.shape.config.description ?? "";
    expect(description).toContain('`"scan"` (the default');
    expect(description).toContain("every condition must be satisfied by tags on the same link");
    // The warning an LLM author most needs: a link-less-only combo never fires.
    expect(description).toContain("has no link to attach to and will never match");
    expect(description).toContain("not evaluated together today");
    expect(description).toContain("at least one positive condition");
  });

  it("forwards tag_slug and target when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCustomRuleTool.handler(
      {
        name: "RX",
        tag_slug: "ml_spam",
        rule_type: "regexp_content",
        config: { pattern: "x" },
        target: "page",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCustomRule") throw new Error("wrong");
    expect(call.body.tag_slug).toBe("ml_spam");
    expect(call.body.target).toBe("page");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createCustomRule = err(makeApiError("invalid-input", "x"));
    expect(
      (
        await createCustomRuleTool.handler(
          { name: "RX", rule_type: "regexp_content", config: {} },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });

  it("surfaces API invalid-input with code as ToolError invalid-input + code", async () => {
    // API returns 422 + `code: checking.system_slug_reserved` when
    // ``tag_slug`` collides with a built-in system tag. The MCP must
    // forward the code so the LLM agent can branch programmatically
    // (e.g. "pick another slug") instead of regexing the detail string.
    const api = createFakeApiGateway();
    api.state.responses.createCustomRule = err(
      makeApiError(
        "invalid-input",
        "Slug 'adblock_detected' is already used by a system tag.",
        "checking.system_slug_reserved"
      )
    );
    const result = await createCustomRuleTool.handler(
      {
        name: "e2e-marker-rule",
        tag_slug: "adblock_detected",
        rule_type: "stopword_content",
        config: { contains: ["x"] },
      },
      makeToolContext({ api })
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.kind).toBe("invalid-input");
      if (result.error.kind === "invalid-input") {
        expect(result.error.code).toBe("checking.system_slug_reserved");
        expect(result.error.message).toContain("adblock_detected");
      }
    }
  });

  it("surfaces API forbidden error as ToolError forbidden", async () => {
    // Completeness: confirms the create-custom-rule code path doesn't
    // swallow a 403 (which the API can return for permission failures
    // unrelated to slug collision).
    const api = createFakeApiGateway();
    api.state.responses.createCustomRule = err(makeApiError("forbidden", "no permission"));
    const result = await createCustomRuleTool.handler(
      { name: "RX", rule_type: "stopword_content", config: {} },
      makeToolContext({ api })
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.kind).toBe("forbidden");
  });
});
