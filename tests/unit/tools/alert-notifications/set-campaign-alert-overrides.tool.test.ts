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
  it("forwards destination_ids + muted", async () => {
    const api = createFakeApiGateway();
    const r = await setCampaignAlertOverridesTool.handler(
      { campaign_id: CID, destination_ids: [DID], muted: true },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().muted).toBe(true);
    expect(r._unsafeUnwrap().destination_ids).toEqual([DID]);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.setCampaignAlertOverrides = err(makeApiError("not-found", "x"));
    expect(
      (
        await setCampaignAlertOverridesTool.handler(
          { campaign_id: CID, destination_ids: [], muted: false },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
