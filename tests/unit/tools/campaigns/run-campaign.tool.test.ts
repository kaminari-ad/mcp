import { describe, expect, it } from "vitest";
import { runCampaignTool } from "../../../../src/application/tools/campaigns/run-campaign.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("runCampaignTool", () => {
  it("name + non-idempotent", () => {
    expect(runCampaignTool.name).toBe("run_campaign");
    expect(runCampaignTool.annotations.idempotentHint).toBe(false);
  });
  it("returns run_id", async () => {
    const api = createFakeApiGateway();
    const r = await runCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().run_id).toBeDefined();
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.runCampaign = err(makeApiError("forbidden", "x"));
    expect((await runCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
