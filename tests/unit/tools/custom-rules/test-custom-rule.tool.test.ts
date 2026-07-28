import { describe, expect, it } from "vitest";

import { testCustomRuleTool } from "../../../../src/application/tools/custom-rules/test-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000aaa";

describe("testCustomRuleTool", () => {
  it("name + read-only-ish (preview)", () => {
    expect(testCustomRuleTool.name).toBe("test_custom_rule");
    expect(testCustomRuleTool.annotations.readOnlyHint).toBe(true);
  });
  it("forwards full body", async () => {
    const api = createFakeApiGateway();
    await testCustomRuleTool.handler(
      { rule_type: "regexp_content", config: { p: "x" }, target: "page", scan_id: SID },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "testCustomRule") throw new Error("wrong");
    expect(call.body.scan_id).toBe(SID);
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
