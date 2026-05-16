import { describe, expect, it } from "vitest";
import { deletePolicySetTool } from "../../../../src/application/tools/policy-sets/delete-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";

describe("deletePolicySetTool", () => {
  it("destructive", () => {
    expect(deletePolicySetTool.name).toBe("delete_policy_set");
    expect(deletePolicySetTool.annotations.destructiveHint).toBe(true);
  });
  it("returns deleted=true", async () => {
    const api = createFakeApiGateway();
    const r = await deletePolicySetTool.handler({ policy_set_id: PID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({ deleted: true });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.deletePolicySet = err(makeApiError("forbidden", "x"));
    expect((await deletePolicySetTool.handler({ policy_set_id: PID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
