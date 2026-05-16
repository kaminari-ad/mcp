import { describe, expect, it } from "vitest";

import { deleteCustomRuleTool } from "../../../../src/application/tools/custom-rules/delete-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000bbb";

describe("deleteCustomRuleTool", () => {
  it("name + uuid", () => {
    expect(deleteCustomRuleTool.name).toBe("delete_custom_rule");
    expect(() => deleteCustomRuleTool.inputSchema.parse({ rule_id: "x" })).toThrow();
  });

  it("returns { deleted: true } on success", async () => {
    const api = createFakeApiGateway();
    const r = await deleteCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ deleted: true });
    const call = api.state.calls[0];
    expect(call).toEqual({ method: "deleteCustomRule", id: RID });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.deleteCustomRule = err(makeApiError("not-found", "x"));
    expect(
      (await deleteCustomRuleTool.handler({ rule_id: RID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
