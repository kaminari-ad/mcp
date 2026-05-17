import { describe, expect, it } from "vitest";

import { listCampaignGroupsTool } from "../../../../src/application/tools/campaign-groups/list-campaign-groups.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listCampaignGroupsTool", () => {
  it("name + defaults", () => {
    expect(listCampaignGroupsTool.name).toBe("list_campaign_groups");
    expect(listCampaignGroupsTool.inputSchema.parse({}).limit).toBe(50);
  });

  it("calls gateway with paging", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listCampaignGroupsTool.handler({ page: 2, limit: 10 }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "listCampaignGroups") throw new Error("wrong");
    expect(call.filters).toEqual({ page: 2, limit: 10 });
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCampaignGroups = err(makeApiError("forbidden", "x"));
    const ctx = makeToolContext({ api });
    expect((await listCampaignGroupsTool.handler({ page: 1, limit: 50 }, ctx)).isErr()).toBe(true);
  });
});
