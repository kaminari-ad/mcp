import { describe, expect, it } from "vitest";
import { updateCustomRuleTool } from "../../../../src/application/tools/custom-rules/update-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000bbb";

describe("updateCustomRuleTool", () => {
  it("name", () => {
    expect(updateCustomRuleTool.name).toBe("update_custom_rule");
  });
  it("forwards only supplied fields", async () => {
    const api = createFakeApiGateway();
    await updateCustomRuleTool.handler({ rule_id: RID, is_active: false }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "updateCustomRule") throw new Error("wrong");
    expect(Object.keys(call.body)).toEqual(["is_active"]);
  });
  it("forwards all fields when supplied", async () => {
    const api = createFakeApiGateway();
    await updateCustomRuleTool.handler(
      {
        rule_id: RID,
        name: "x",
        tag_slug: "y",
        rule_type: "regex",
        config: { p: "v" },
        target: "html",
        is_active: true,
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateCustomRule") throw new Error("wrong");
    expect(Object.keys(call.body).sort()).toEqual(["config", "is_active", "name", "rule_type", "tag_slug", "target"]);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateCustomRule = err(makeApiError("not-found", "x"));
    expect((await updateCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
