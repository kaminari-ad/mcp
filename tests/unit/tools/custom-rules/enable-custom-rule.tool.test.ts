import { describe, expect, it } from "vitest";

import { enableCustomRuleTool } from "../../../../src/application/tools/custom-rules/enable-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000bbb";

describe("enableCustomRuleTool", () => {
  it("name + uuid", () => {
    expect(enableCustomRuleTool.name).toBe("enable_custom_rule");
    expect(() => enableCustomRuleTool.inputSchema.parse({ rule_id: "x" })).toThrow();
  });

  it("calls the gateway and returns the rule", async () => {
    const api = createFakeApiGateway();
    const r = await enableCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().id).toBeTruthy();
    expect(api.state.calls[0]).toEqual({ method: "enableCustomRule", id: RID });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.enableCustomRule = err(makeApiError("not-found", "x"));
    expect(
      (await enableCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
