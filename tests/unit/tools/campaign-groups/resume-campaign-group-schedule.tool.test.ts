import { describe, expect, it } from "vitest";

import { resumeCampaignGroupScheduleTool } from "../../../../src/application/tools/campaign-groups/resume-campaign-group-schedule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("resumeCampaignGroupScheduleTool", () => {
  it("name", () => {
    expect(resumeCampaignGroupScheduleTool.name).toBe("resume_campaign_group_schedule");
  });
  it("returns schedule_paused=false", async () => {
    const api = createFakeApiGateway();
    const r = await resumeCampaignGroupScheduleTool.handler(
      { group_id: GID },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().schedule_paused).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.resumeCampaignGroupSchedule = err(makeApiError("forbidden", "x"));
    expect(
      (
        await resumeCampaignGroupScheduleTool.handler({ group_id: GID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
