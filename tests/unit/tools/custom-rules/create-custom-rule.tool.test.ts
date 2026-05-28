import { describe, expect, it } from "vitest";

import { createCustomRuleTool } from "../../../../src/application/tools/custom-rules/create-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createCustomRuleTool", () => {
  it("name + validates name length", () => {
    expect(createCustomRuleTool.name).toBe("create_custom_rule");
    expect(() =>
      createCustomRuleTool.inputSchema.parse({ name: "", rule_type: "regex", config: {} })
    ).toThrow();
  });

  it("forwards body and omits absent optionals", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCustomRuleTool.handler(
      {
        name: "RX",
        rule_type: "regex",
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

  it("forwards tag_slug and target when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCustomRuleTool.handler(
      {
        name: "RX",
        tag_slug: "ml.spam",
        rule_type: "regex",
        config: { pattern: "x" },
        target: "html",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCustomRule") throw new Error("wrong");
    expect(call.body.tag_slug).toBe("ml.spam");
    expect(call.body.target).toBe("html");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createCustomRule = err(makeApiError("invalid-input", "x"));
    expect(
      (
        await createCustomRuleTool.handler(
          { name: "RX", rule_type: "regex", config: {} },
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
