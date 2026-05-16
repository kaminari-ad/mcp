import { describe, expect, it } from "vitest";

import { updateCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/update-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("updateCampaignGroupTool", () => {
  it("name + uuid validation", () => {
    expect(updateCampaignGroupTool.name).toBe("update_campaign_group");
    expect(() => updateCampaignGroupTool.inputSchema.parse({ group_id: "x" })).toThrow();
  });

  it("forwards both fields when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await updateCampaignGroupTool.handler(
      { group_id: GID, name: "renamed", schedule_paused: true },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateCampaignGroup") throw new Error("wrong");
    expect(call.body).toEqual({ name: "renamed", schedule_paused: true });
  });

  it("forwards empty body when neither field supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await updateCampaignGroupTool.handler({ group_id: GID }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "updateCampaignGroup") throw new Error("wrong");
    expect(call.body).toEqual({});
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateCampaignGroup = err(makeApiError("not-found", "x"));
    const ctx = makeToolContext({ api });
    expect((await updateCampaignGroupTool.handler({ group_id: GID }, ctx)).isErr()).toBe(true);
  });
});
