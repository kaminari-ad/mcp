import { describe, expect, it } from "vitest";

import { disableCustomRuleTool } from "../../../../src/application/tools/custom-rules/disable-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000bbb";

describe("disableCustomRuleTool", () => {
  it("r10: name + uuid", () => {
    expect(disableCustomRuleTool.name).toBe("disable_custom_rule");
    expect(() => disableCustomRuleTool.inputSchema.parse({ rule_id: "x" })).toThrow();
  });

  it("r10: calls the gateway and returns the rule", async () => {
    const api = createFakeApiGateway();
    const r = await disableCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().id).toBeTruthy();
    expect(api.state.calls[0]).toEqual({ method: "disableCustomRule", id: RID });
  });

  it("r10: maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.disableCustomRule = err(makeApiError("not-found", "x"));
    expect(
      (await disableCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
