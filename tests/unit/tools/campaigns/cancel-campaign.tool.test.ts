import { describe, expect, it } from "vitest";

import { cancelCampaignTool } from "../../../../src/application/tools/campaigns/cancel-campaign.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("cancelCampaignTool", () => {
  it("name", () => {
    expect(cancelCampaignTool.name).toBe("cancel_campaign");
  });
  it("returns cancelled_count and forwards the campaign id", async () => {
    const api = createFakeApiGateway();
    const r = await cancelCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().cancelled_count).toBe(0);
    const call = api.state.calls[0];
    if (call?.method !== "cancelCampaign") throw new Error("wrong");
    expect(call.id).toBe(CID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.cancelCampaign = err(makeApiError("not-found", "x"));
    expect(
      (await cancelCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
