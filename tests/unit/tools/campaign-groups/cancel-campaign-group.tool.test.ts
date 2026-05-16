import { describe, expect, it } from "vitest";

import { cancelCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/cancel-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("cancelCampaignGroupTool", () => {
  it("name", () => {
    expect(cancelCampaignGroupTool.name).toBe("cancel_campaign_group");
  });
  it("returns the aggregate group action result", async () => {
    const api = createFakeApiGateway();
    const r = await cancelCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    const v = r._unsafeUnwrap();
    expect(v.group_id).toBe(GID);
    expect(v.affected_campaigns).toBe(1);
    expect(v.cancelled_count).toBe(0);
    expect(v.failures).toEqual([]);
    const call = api.state.calls[0];
    if (call?.method !== "cancelCampaignGroup") throw new Error("wrong");
    expect(call.id).toBe(GID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.cancelCampaignGroup = err(makeApiError("forbidden", "x"));
    expect(
      (await cancelCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
