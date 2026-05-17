import { describe, expect, it } from "vitest";

import { archiveCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/archive-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("archiveCampaignGroupTool", () => {
  it("name", () => {
    expect(archiveCampaignGroupTool.name).toBe("archive_campaign_group");
  });
  it("returns is_archived=true", async () => {
    const api = createFakeApiGateway();
    const r = await archiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().is_archived).toBe(true);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.archiveCampaignGroup = err(makeApiError("forbidden", "default"));
    expect(
      (await archiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
