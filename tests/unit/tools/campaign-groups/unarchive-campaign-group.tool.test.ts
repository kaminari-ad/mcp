import { describe, expect, it } from "vitest";

import { unarchiveCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/unarchive-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("unarchiveCampaignGroupTool", () => {
  it("name", () => {
    expect(unarchiveCampaignGroupTool.name).toBe("unarchive_campaign_group");
  });

  it("returns the GroupActionResponse summary on success", async () => {
    const api = createFakeApiGateway();
    const r = await unarchiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    const payload = r._unsafeUnwrap();
    // Same envelope as archive; cancelled_count is typically 0 here.
    expect(payload.group_id).toBe("00000000-0000-0000-0000-000000000111");
    expect(typeof payload.affected_campaigns).toBe("number");
  });

  it("forwards the group id to the gateway", async () => {
    const api = createFakeApiGateway();
    await unarchiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    expect(api.state.calls[0]).toEqual({ method: "unarchiveCampaignGroup", id: GID });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.unarchiveCampaignGroup = err(makeApiError("not-found", "x"));
    expect(
      (
        await unarchiveCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
