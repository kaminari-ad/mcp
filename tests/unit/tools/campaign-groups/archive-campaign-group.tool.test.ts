import { describe, expect, it } from "vitest";

import { archiveCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/archive-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("archiveCampaignGroupTool", () => {
  it("name", () => {
    expect(archiveCampaignGroupTool.name).toBe("archive_campaign_group");
  });

  it("returns the GroupActionResponse summary on success", async () => {
    const api = createFakeApiGateway();
    const r = await archiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    const payload = r._unsafeUnwrap();
    // Action endpoint — response is { group_id, affected_campaigns,
    // cancelled_count, run_ids, failures }, NOT a group entity.
    // Group id in the action summary is DEFAULT_GROUP.id from the fake
    // (the fake records the request id but echoes its canned response).
    expect(typeof payload.group_id).toBe("string");
    expect(typeof payload.affected_campaigns).toBe("number");
    expect(payload.cancelled_count).toBe(0);
  });

  it("forwards the group id to the gateway", async () => {
    const api = createFakeApiGateway();
    await archiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    expect(api.state.calls[0]).toEqual({ method: "archiveCampaignGroup", id: GID });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.archiveCampaignGroup = err(makeApiError("forbidden", "default"));
    expect(
      (await archiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
