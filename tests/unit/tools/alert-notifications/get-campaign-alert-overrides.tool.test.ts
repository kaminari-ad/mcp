import { describe, expect, it } from "vitest";

import { getCampaignAlertOverridesTool } from "../../../../src/application/tools/alert-notifications/get-campaign-alert-overrides.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("getCampaignAlertOverridesTool", () => {
  it("read-only", () => {
    expect(getCampaignAlertOverridesTool.name).toBe("get_campaign_alert_overrides");
    expect(getCampaignAlertOverridesTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns overrides", async () => {
    const api = createFakeApiGateway();
    const r = await getCampaignAlertOverridesTool.handler(
      { campaign_id: CID },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().campaign_id).toBe(CID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getCampaignAlertOverrides = err(makeApiError("not-found", "x"));
    expect(
      (
        await getCampaignAlertOverridesTool.handler({ campaign_id: CID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
