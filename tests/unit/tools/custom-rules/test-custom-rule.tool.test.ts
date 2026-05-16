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
      { rule_type: "regex", config: { p: "x" }, target: "page", scan_id: SID },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "testCustomRule") throw new Error("wrong");
    expect(call.body.scan_id).toBe(SID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.testCustomRule = err(makeApiError("invalid-input", "regex"));
    expect(
      (
        await testCustomRuleTool.handler(
          { rule_type: "regex", config: {}, target: "page", scan_id: SID },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
