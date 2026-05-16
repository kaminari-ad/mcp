import { describe, expect, it } from "vitest";
import { unarchiveCampaignTool } from "../../../../src/application/tools/campaigns/unarchive-campaign.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("unarchiveCampaignTool", () => {
  it("name", () => {
    expect(unarchiveCampaignTool.name).toBe("unarchive_campaign");
  });
  it("is_archived=false on result", async () => {
    const api = createFakeApiGateway();
    const r = await unarchiveCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().is_archived).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.unarchiveCampaign = err(makeApiError("not-found", "x"));
    expect((await unarchiveCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
