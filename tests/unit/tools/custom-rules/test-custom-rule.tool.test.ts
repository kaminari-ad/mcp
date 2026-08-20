import { describe, expect, it } from "vitest";

import { requestUrlRuleConfigSchema } from "../../../../src/application/tools/custom-rules/_request-url-rule-input.js";
import { testCustomRuleTool } from "../../../../src/application/tools/custom-rules/test-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000aaa";

describe("testCustomRuleTool", () => {
  it("name + read-only-ish (preview)", () => {
    expect(testCustomRuleTool.name).toBe("test_custom_rule");
    expect(testCustomRuleTool.annotations.readOnlyHint).toBe(true);
  });

  it("documents regexp_request_url config and URL coverage", () => {
    const { rule_type, config, target } = testCustomRuleTool.inputSchema.shape;

    expect(testCustomRuleTool.description).toContain("at most 200 persisted subrequests");
    expect(testCustomRuleTool.description).toContain("a no-match does not prove");
    expect(testCustomRuleTool.description).toContain(
      "does not expose the matched request URL separately"
    );
    expect(rule_type.description).toContain("`regexp_request_url`");
    expect(config.description).toContain("flags?: '' | 'i'");
    expect(config.description).toContain("at most 4,096 characters");
    expect(config.description).toContain("up to 200 persisted subrequests");
    expect(config.description).toContain("`regexp_url` remains redirect-chain-only");
    expect(target.description).toContain("`regexp_request_url` requires `target='page'`");
  });

  it("rejects malformed request-URL input before the gateway call", async () => {
    expect(requestUrlRuleConfigSchema.safeParse({ pattern: "tracker", flags: "im" }).success).toBe(
      false
    );

    const api = createFakeApiGateway();
    const result = await testCustomRuleTool.handler(
      {
        rule_type: "regexp_request_url",
        config: {},
        target: "creative",
        scan_id: SID,
      },
      makeToolContext({ api })
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.kind).toBe("invalid-input");
    expect(api.state.calls).toEqual([]);
  });

  it("forwards full body", async () => {
    const api = createFakeApiGateway();
    await testCustomRuleTool.handler(
      {
        rule_type: "regexp_request_url",
        config: { pattern: "tracker\\.example", flags: "i" },
        target: "page",
        scan_id: SID,
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "testCustomRule") throw new Error("wrong");
    expect(call.body).toEqual({
      rule_type: "regexp_request_url",
      config: { pattern: "tracker\\.example", flags: "i" },
      target: "page",
      scan_id: SID,
    });
  });
  it("previews a per-URL combo config and rejects an unknown match_scope", async () => {
    const api = createFakeApiGateway();
    await testCustomRuleTool.handler(
      {
        rule_type: "combo",
        config: { match_scope: "url", tag_category: "antivirus", count_gte: 5 },
        target: "page",
        scan_id: SID,
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "testCustomRule") throw new Error("wrong");
    expect(call.body.config).toEqual({
      match_scope: "url",
      tag_category: "antivirus",
      count_gte: 5,
    });
    expect(
      testCustomRuleTool.inputSchema.safeParse({
        rule_type: "combo",
        config: { match_scope: "scan-wide", count_gte: 5 },
        target: "page",
        scan_id: SID,
      }).success
    ).toBe(false);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.testCustomRule = err(makeApiError("invalid-input", "regex"));
    expect(
      (
        await testCustomRuleTool.handler(
          { rule_type: "regexp_content", config: {}, target: "page", scan_id: SID },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });

  it("surfaces API invalid-input error with kind", async () => {
    // test_custom_rule is preview-only (no rule persistence), but its
    // error-mapping pipeline is identical to create/update — assert
    // that ``invalid-input`` survives the kind narrowing so agents
    // can branch on it. Codes are NOT expected on this endpoint
    // (no slug-collision validation runs in preview mode) but the
    // kind contract is the same.
    const api = createFakeApiGateway();
    api.state.responses.testCustomRule = err(makeApiError("invalid-input", "bad regex pattern"));
    const result = await testCustomRuleTool.handler(
      { rule_type: "regexp_content", config: { pattern: "[" }, target: "page", scan_id: SID },
      makeToolContext({ api })
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.kind).toBe("invalid-input");
      if (result.error.kind === "invalid-input") {
        expect(result.error.message).toContain("bad regex");
      }
    }
  });
});
