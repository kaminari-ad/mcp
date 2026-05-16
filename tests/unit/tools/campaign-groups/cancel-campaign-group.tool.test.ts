import { describe, expect, it } from "vitest";
import { cancelCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/cancel-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("cancelCampaignGroupTool", () => {
  it("name", () => {
    expect(cancelCampaignGroupTool.name).toBe("cancel_campaign_group");
  });
  it("returns affected_count", async () => {
    const api = createFakeApiGateway();
    const r = await cancelCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().affected_count).toBe(0);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.cancelCampaignGroup = err(makeApiError("forbidden", "x"));
    expect((await cancelCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
