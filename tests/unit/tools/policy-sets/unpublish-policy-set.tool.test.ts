import { describe, expect, it } from "vitest";

import { unpublishPolicySetTool } from "../../../../src/application/tools/policy-sets/unpublish-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";

describe("unpublishPolicySetTool", () => {
  it("name + destructive but idempotent", () => {
    expect(unpublishPolicySetTool.name).toBe("unpublish_policy_set");
    expect(unpublishPolicySetTool.annotations.destructiveHint).toBe(true);
    expect(unpublishPolicySetTool.annotations.idempotentHint).toBe(true);
  });
  it("forwards the policy-set id and returns { unpublished: true } on 204", async () => {
    const api = createFakeApiGateway();
    const r = await unpublishPolicySetTool.handler(
      { policy_set_id: PID },
      makeToolContext({ api })
    );
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ unpublished: true });
    const call = api.state.calls[0];
    if (call?.method !== "unpublishPolicySet") throw new Error("wrong");
    expect(call.id).toBe(PID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.unpublishPolicySet = err(makeApiError("forbidden", "x"));
    expect(
      (
        await unpublishPolicySetTool.handler({ policy_set_id: PID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
