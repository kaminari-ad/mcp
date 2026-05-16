import { describe, expect, it } from "vitest";

import { createCampaignGroupTool } from "../../../../src/application/tools/campaign-groups/create-campaign-group.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createCampaignGroupTool", () => {
  it("name + name length validation", () => {
    expect(createCampaignGroupTool.name).toBe("create_campaign_group");
    expect(() => createCampaignGroupTool.inputSchema.parse({ name: "" })).toThrow();
  });

  it("forwards name", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const r = await createCampaignGroupTool.handler({ name: "marketing" }, ctx);
    expect(r.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "createCampaignGroup") throw new Error("wrong");
    expect(call.body).toEqual({ name: "marketing" });
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createCampaignGroup = err(makeApiError("invalid-input", "dup"));
    const ctx = makeToolContext({ api });
    expect((await createCampaignGroupTool.handler({ name: "x" }, ctx)).isErr()).toBe(true);
  });
});
