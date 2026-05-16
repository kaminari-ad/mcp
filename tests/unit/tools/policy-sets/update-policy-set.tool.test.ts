import { describe, expect, it } from "vitest";
import { updatePolicySetTool } from "../../../../src/application/tools/policy-sets/update-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";

describe("updatePolicySetTool", () => {
  it("name + uuid", () => {
    expect(updatePolicySetTool.name).toBe("update_policy_set");
    expect(() => updatePolicySetTool.inputSchema.parse({ policy_set_id: "x" })).toThrow();
  });
  it("forwards entries when supplied", async () => {
    const api = createFakeApiGateway();
    await updatePolicySetTool.handler(
      { policy_set_id: PID, entries: [{ tag_slug: "x", country_codes: ["US"] }] },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updatePolicySet") throw new Error("wrong");
    expect(call.body.entries?.[0]?.tag_slug).toBe("x");
  });
  it("omits entries when not supplied", async () => {
    const api = createFakeApiGateway();
    await updatePolicySetTool.handler({ policy_set_id: PID, name: "rn" }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "updatePolicySet") throw new Error("wrong");
    expect(call.body.entries).toBeUndefined();
    expect(call.body.name).toBe("rn");
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updatePolicySet = err(makeApiError("not-found", "x"));
    expect((await updatePolicySetTool.handler({ policy_set_id: PID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
