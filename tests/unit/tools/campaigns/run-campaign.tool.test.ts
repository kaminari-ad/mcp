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
  it("returns the new run", async () => {
    const api = createFakeApiGateway();
    const r = await runCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }));
    const v = r._unsafeUnwrap();
    expect(v.id).toBeDefined();
    expect(v.campaign_id).toBe(CID);
    const call = api.state.calls[0];
    if (call?.method !== "runCampaign") throw new Error("wrong");
    expect(call.id).toBe(CID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.runCampaign = err(makeApiError("forbidden", "x"));
    expect(
      (await runCampaignTool.handler({ campaign_id: CID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
