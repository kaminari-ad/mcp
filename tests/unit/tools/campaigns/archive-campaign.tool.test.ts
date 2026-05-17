import { describe, expect, it } from "vitest";

import { archiveCampaignTool } from "../../../../src/application/tools/campaigns/archive-campaign.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("archiveCampaignTool", () => {
  it("name", () => {
    expect(archiveCampaignTool.name).toBe("archive_campaign");
  });

  it("forwards id and returns archived campaign", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const r = await archiveCampaignTool.handler({ campaign_id: CID }, ctx);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().is_archived).toBe(true);
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.archiveCampaign = err(makeApiError("forbidden", "x"));
    const ctx = makeToolContext({ api });
    expect((await archiveCampaignTool.handler({ campaign_id: CID }, ctx)).isErr()).toBe(true);
  });
});
