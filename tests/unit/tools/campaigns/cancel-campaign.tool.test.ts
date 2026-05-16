import { describe, expect, it } from "vitest";
import { cancelCampaignTool } from "../../../../src/application/tools/campaigns/cancel-campaign.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("cancelCampaignTool", () => {
  it("name", () => {
    expect(cancelCampaignTool.name).toBe("cancel_campaign");
  });
  it("returns affected_count", async () => {
    const api = createFakeApiGateway();
    const r = await cancelCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().affected_count).toBe(0);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.cancelCampaign = err(makeApiError("not-found", "x"));
    expect((await cancelCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
