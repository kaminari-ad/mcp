import { describe, expect, it } from "vitest";

import { detachPolicySetCampaignsTool } from "../../../../src/application/tools/policy-sets/detach-policy-set-campaigns.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";
const C1 = "00000000-0000-0000-0000-0000000000c1";

describe("detachPolicySetCampaignsTool", () => {
  it("destructive", () => {
    expect(detachPolicySetCampaignsTool.name).toBe("detach_policy_set_campaigns");
    expect(detachPolicySetCampaignsTool.annotations.destructiveHint).toBe(true);
  });
  it("forwards named campaigns with detach_all false", async () => {
    const api = createFakeApiGateway();
    const r = await detachPolicySetCampaignsTool.handler(
      { policy_set_id: PID, campaign_ids: [C1] },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap()).toEqual({ detached: 1 });
    expect(api.state.calls[0]).toEqual({
      method: "detachPolicySetCampaigns",
      id: PID,
      body: { detach_all: false, campaign_ids: [C1] },
    });
  });
  it("forwards detach_all without an id list", async () => {
    const api = createFakeApiGateway();
    const r = await detachPolicySetCampaignsTool.handler(
      { policy_set_id: PID, detach_all: true },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap()).toEqual({ detached: "all" });
    expect(api.state.calls[0]).toEqual({
      method: "detachPolicySetCampaigns",
      id: PID,
      body: { detach_all: true },
    });
  });

  // Both selection modes at once is ambiguous, and neither is a silent
  // no-op the agent would read as success.
  it("rejects both campaign_ids and detach_all", async () => {
    const api = createFakeApiGateway();
    const r = await detachPolicySetCampaignsTool.handler(
      { policy_set_id: PID, campaign_ids: [C1], detach_all: true },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().kind).toBe("invalid-input");
    expect(api.state.calls).toHaveLength(0);
  });
  it("rejects neither campaign_ids nor detach_all", async () => {
    const api = createFakeApiGateway();
    const r = await detachPolicySetCampaignsTool.handler(
      { policy_set_id: PID },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
    expect(api.state.calls).toHaveLength(0);
  });
  it("treats detach_all false as 'no selection'", async () => {
    const api = createFakeApiGateway();
    const r = await detachPolicySetCampaignsTool.handler(
      { policy_set_id: PID, detach_all: false },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
    expect(api.state.calls).toHaveLength(0);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.detachPolicySetCampaigns = err(makeApiError("forbidden", "x"));
    expect(
      (
        await detachPolicySetCampaignsTool.handler(
          { policy_set_id: PID, detach_all: true },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
