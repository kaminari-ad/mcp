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
    await updateCustomRuleTool.handler(
      { rule_id: RID, is_active: false },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateCustomRule") throw new Error("wrong");
    expect(Object.keys(call.body)).toEqual(["is_active"]);
  });
  it("forwards all fields when supplied (rule_type is immutable, not allowed in update)", async () => {
    const api = createFakeApiGateway();
    await updateCustomRuleTool.handler(
      {
        rule_id: RID,
        name: "x",
        tag_slug: "y",
        config: { p: "v" },
        target: "html",
        is_active: true,
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateCustomRule") throw new Error("wrong");
    expect(Object.keys(call.body).sort()).toEqual([
      "config",
      "is_active",
      "name",
      "tag_slug",
      "target",
    ]);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateCustomRule = err(makeApiError("not-found", "x"));
    expect(
      (await updateCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });

  it("surfaces API invalid-input with code as ToolError invalid-input + code", async () => {
    // Mirror of the create-custom-rule contract: changing ``tag_slug``
    // onto a system slug returns 422 with code
    // ``checking.system_slug_reserved``. The code must reach the LLM
    // agent through the MCP, not be dropped to "Invalid input".
    const api = createFakeApiGateway();
    api.state.responses.updateCustomRule = err(
      makeApiError(
        "invalid-input",
        "Slug 'adblock_detected' is already used by a system tag.",
        "checking.system_slug_reserved"
      )
    );
    const result = await updateCustomRuleTool.handler(
      { rule_id: RID, tag_slug: "adblock_detected" },
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
});
