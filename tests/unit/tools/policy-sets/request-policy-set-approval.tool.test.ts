import { describe, expect, it } from "vitest";

import { requestPolicySetApprovalTool } from "../../../../src/application/tools/policy-sets/request-policy-set-approval.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";

describe("requestPolicySetApprovalTool", () => {
  it("name + non-idempotent", () => {
    expect(requestPolicySetApprovalTool.name).toBe("request_policy_set_approval");
    expect(requestPolicySetApprovalTool.annotations.idempotentHint).toBe(false);
  });
  it("returns policy set", async () => {
    const api = createFakeApiGateway();
    const r = await requestPolicySetApprovalTool.handler(
      { policy_set_id: PID },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().id).toBe(PID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.requestPolicySetApproval = err(makeApiError("forbidden", "x"));
    expect(
      (
        await requestPolicySetApprovalTool.handler({ policy_set_id: PID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
