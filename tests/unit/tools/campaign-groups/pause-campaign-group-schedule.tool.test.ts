import { describe, expect, it } from "vitest";

import { pauseCampaignGroupScheduleTool } from "../../../../src/application/tools/campaign-groups/pause-campaign-group-schedule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("pauseCampaignGroupScheduleTool", () => {
  it("name", () => {
    expect(pauseCampaignGroupScheduleTool.name).toBe("pause_campaign_group_schedule");
  });
  it("returns schedule_paused=true", async () => {
    const api = createFakeApiGateway();
    const r = await pauseCampaignGroupScheduleTool.handler(
      { group_id: GID },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().schedule_paused).toBe(true);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.pauseCampaignGroupSchedule = err(makeApiError("forbidden", "x"));
    expect(
      (
        await pauseCampaignGroupScheduleTool.handler({ group_id: GID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
