import { describe, expect, it } from "vitest";
import { runCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/run-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("runCampaignGroupTool", () => {
  it("name", () => {
    expect(runCampaignGroupTool.name).toBe("run_campaign_group");
  });
  it("returns run_id", async () => {
    const api = createFakeApiGateway();
    const r = await runCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().run_id).toBeDefined();
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.runCampaignGroup = err(makeApiError("forbidden", "x"));
    expect((await runCampaignGroupTool.handler({ group_id: GID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
