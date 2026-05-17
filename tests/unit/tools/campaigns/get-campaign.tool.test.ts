import { describe, expect, it } from "vitest";

import { getCampaignTool } from "../../../../src/application/tools/campaigns/get-campaign.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getCampaignTool", () => {
  it("name + uuid validation", () => {
    expect(getCampaignTool.name).toBe("get_campaign");
    expect(() => getCampaignTool.inputSchema.parse({ campaign_id: "x" })).toThrow();
  });

  it("forwards id and returns campaign", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const r = await getCampaignTool.handler(
      { campaign_id: "00000000-0000-0000-0000-000000000ccc" },
      ctx
    );
    expect(r.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "getCampaign") throw new Error("wrong");
    expect(call.id).toBe("00000000-0000-0000-0000-000000000ccc");
  });

  it("maps not-found", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getCampaign = err(makeApiError("not-found", "x"));
    const ctx = makeToolContext({ api });
    const r = await getCampaignTool.handler(
      { campaign_id: "00000000-0000-0000-0000-000000000ccc" },
      ctx
    );
    expect(r.isErr()).toBe(true);
  });
});
