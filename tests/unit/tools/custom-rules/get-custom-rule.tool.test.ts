import { describe, expect, it } from "vitest";
import { getCustomRuleTool } from "../../../../src/application/tools/custom-rules/get-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000bbb";

describe("getCustomRuleTool", () => {
  it("name + read-only", () => {
    expect(getCustomRuleTool.name).toBe("get_custom_rule");
    expect(getCustomRuleTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns rule", async () => {
    const api = createFakeApiGateway();
    const r = await getCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().id).toBe(RID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getCustomRule = err(makeApiError("not-found", "x"));
    expect((await getCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
