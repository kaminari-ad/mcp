import { describe, expect, it } from "vitest";

import { attachPolicySetCampaignsTool } from "../../../../src/application/tools/policy-sets/attach-policy-set-campaigns.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";
const C1 = "00000000-0000-0000-0000-0000000000c1";
const C2 = "00000000-0000-0000-0000-0000000000c2";

describe("attachPolicySetCampaignsTool", () => {
  it("not destructive — existing bindings survive", () => {
    expect(attachPolicySetCampaignsTool.name).toBe("attach_policy_set_campaigns");
    expect(attachPolicySetCampaignsTool.annotations.destructiveHint).toBe(false);
    expect(attachPolicySetCampaignsTool.annotations.idempotentHint).toBe(true);
  });
  it("forwards the campaign ids and reports how many were attached", async () => {
    const api = createFakeApiGateway();
    const r = await attachPolicySetCampaignsTool.handler(
      { policy_set_id: PID, campaign_ids: [C1, C2] },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap()).toEqual({ attached: 2 });
    expect(api.state.calls[0]).toEqual({
      method: "attachPolicySetCampaigns",
      id: PID,
      body: { campaign_ids: [C1, C2] },
    });
  });
  it("rejects an empty list at the schema boundary", () => {
    const parsed = attachPolicySetCampaignsTool.inputSchema.safeParse({
      policy_set_id: PID,
      campaign_ids: [],
    });
    expect(parsed.success).toBe(false);
  });
  it("rejects more than the API's 500-id cap", () => {
    const parsed = attachPolicySetCampaignsTool.inputSchema.safeParse({
      policy_set_id: PID,
      campaign_ids: Array.from({ length: 501 }, () => C1),
    });
    expect(parsed.success).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.attachPolicySetCampaigns = err(makeApiError("not-found", "x"));
    expect(
      (
        await attachPolicySetCampaignsTool.handler(
          { policy_set_id: PID, campaign_ids: [C1] },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
