import { describe, expect, it } from "vitest";

import { setCampaignAlertOverridesTool } from "../../../../src/application/tools/alert-notifications/set-campaign-alert-overrides.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";
const DID = "00000000-0000-0000-0000-000000000999";

describe("setCampaignAlertOverridesTool", () => {
  it("idempotent", () => {
    expect(setCampaignAlertOverridesTool.name).toBe("set_campaign_alert_overrides");
    expect(setCampaignAlertOverridesTool.annotations.idempotentHint).toBe(true);
  });
  it("forwards mode + destination_ids on the call body", async () => {
    const api = createFakeApiGateway();
    await setCampaignAlertOverridesTool.handler(
      { campaign_id: CID, mode: "include", destination_ids: [DID] },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "setCampaignAlertOverrides") throw new Error("wrong");
    expect(call.campaignId).toBe(CID);
    expect(call.body).toEqual({ mode: "include", destination_ids: [DID] });
  });
  it("inherit mode forwards empty destination_ids", async () => {
    const api = createFakeApiGateway();
    await setCampaignAlertOverridesTool.handler(
      { campaign_id: CID, mode: "inherit", destination_ids: [] },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "setCampaignAlertOverrides") throw new Error("wrong");
    expect(call.body.mode).toBe("inherit");
    expect(call.body.destination_ids).toEqual([]);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.setCampaignAlertOverrides = err(makeApiError("not-found", "x"));
    expect(
      (
        await setCampaignAlertOverridesTool.handler(
          { campaign_id: CID, mode: "inherit", destination_ids: [] },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
