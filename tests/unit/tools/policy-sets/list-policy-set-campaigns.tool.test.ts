import { describe, expect, it } from "vitest";

import { listPolicySetCampaignsTool } from "../../../../src/application/tools/policy-sets/list-policy-set-campaigns.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";

describe("listPolicySetCampaignsTool", () => {
  it("read-only", () => {
    expect(listPolicySetCampaignsTool.name).toBe("list_policy_set_campaigns");
    expect(listPolicySetCampaignsTool.annotations.readOnlyHint).toBe(true);
  });
  it("forwards the id and paging, returning the envelope", async () => {
    const api = createFakeApiGateway();
    const r = await listPolicySetCampaignsTool.handler(
      { policy_set_id: PID, page: 2, limit: 25 },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().page).toBe(2);
    expect(api.state.calls[0]).toEqual({
      method: "listPolicySetCampaigns",
      id: PID,
      filters: { page: 2, limit: 25 },
    });
  });
  it("forwards the name search only when supplied", async () => {
    const api = createFakeApiGateway();
    await listPolicySetCampaignsTool.handler(
      { policy_set_id: PID, page: 1, limit: 50, q: "black friday" },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listPolicySetCampaigns") throw new Error("wrong");
    expect(call.filters.q).toBe("black friday");
  });
  it("omits an absent search rather than sending undefined", async () => {
    const api = createFakeApiGateway();
    await listPolicySetCampaignsTool.handler(
      { policy_set_id: PID, page: 1, limit: 50 },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listPolicySetCampaigns") throw new Error("wrong");
    expect("q" in call.filters).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listPolicySetCampaigns = err(makeApiError("not-found", "x"));
    expect(
      (
        await listPolicySetCampaignsTool.handler(
          { policy_set_id: PID, page: 1, limit: 50 },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
