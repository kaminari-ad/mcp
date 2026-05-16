import { describe, expect, it } from "vitest";
import { listCampaignRunsTool } from "../../../../src/application/tools/campaigns/list-campaign-runs.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("listCampaignRunsTool", () => {
  it("name + read-only", () => {
    expect(listCampaignRunsTool.name).toBe("list_campaign_runs");
    expect(listCampaignRunsTool.annotations.readOnlyHint).toBe(true);
  });
  it("forwards pagination", async () => {
    const api = createFakeApiGateway();
    await listCampaignRunsTool.handler({ campaign_id: CID, page: 2, limit: 10 }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listCampaignRuns") throw new Error("wrong");
    expect(call.filters).toEqual({ page: 2, limit: 10 });
    expect(call.campaignId).toBe(CID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCampaignRuns = err(makeApiError("forbidden", "x"));
    expect(
      (await listCampaignRunsTool.handler({ campaign_id: CID, page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
