import { describe, expect, it } from "vitest";

import { getCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/get-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const GID = "00000000-0000-0000-0000-000000000111";

describe("getCampaignGroupTool", () => {
  it("name + uuid validation", () => {
    expect(getCampaignGroupTool.name).toBe("get_campaign_group");
    expect(() => getCampaignGroupTool.inputSchema.parse({ group_id: "x" })).toThrow();
  });

  it("forwards id and returns group", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const r = await getCampaignGroupTool.handler({ group_id: GID }, ctx);
    expect(r.isOk()).toBe(true);
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getCampaignGroup = err(makeApiError("not-found", "x"));
    const ctx = makeToolContext({ api });
    expect((await getCampaignGroupTool.handler({ group_id: GID }, ctx)).isErr()).toBe(true);
  });
});
