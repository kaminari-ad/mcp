import { describe, expect, it } from "vitest";
import { unarchiveCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/unarchive-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("unarchiveCampaignGroupTool", () => {
  it("name", () => {
    expect(unarchiveCampaignGroupTool.name).toBe("unarchive_campaign_group");
  });
  it("returns is_archived=false", async () => {
    const api = createFakeApiGateway();
    const r = await unarchiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().is_archived).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.unarchiveCampaignGroup = err(makeApiError("not-found", "x"));
    expect((await unarchiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
