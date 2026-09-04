import { describe, expect, it } from "vitest";

import { setDefaultPolicySetTool } from "../../../../src/application/tools/policy-sets/set-default-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";

describe("setDefaultPolicySetTool", () => {
  it("name + idempotent write", () => {
    expect(setDefaultPolicySetTool.name).toBe("set_default_policy_set");
    expect(setDefaultPolicySetTool.annotations.readOnlyHint).toBe(false);
    expect(setDefaultPolicySetTool.annotations.idempotentHint).toBe(true);
  });

  it("forwards id + flag and echoes is_default on 204", async () => {
    const api = createFakeApiGateway();
    const r = await setDefaultPolicySetTool.handler(
      { policy_set_id: PID, is_default: true },
      makeToolContext({ api })
    );
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ is_default: true });
    const call = api.state.calls[0];
    if (call?.method !== "setDefaultPolicySet") throw new Error("wrong");
    expect(call.id).toBe(PID);
    expect(call.isDefault).toBe(true);
  });

  it("rejects invalid uuid before calling the gateway", async () => {
    const api = createFakeApiGateway();
    expect(() =>
      setDefaultPolicySetTool.inputSchema.parse({
        policy_set_id: "not-a-uuid",
        is_default: true,
      })
    ).toThrow();
    expect(api.state.calls).toHaveLength(0);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.setDefaultPolicySet = err(makeApiError("not-found", "x"));
    expect(
      (
        await setDefaultPolicySetTool.handler(
          { policy_set_id: PID, is_default: false },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
