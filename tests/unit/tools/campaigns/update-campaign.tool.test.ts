import { describe, expect, it } from "vitest";

import { updateCampaignTool } from "../../../../src/application/tools/campaigns/update-campaign.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("updateCampaignTool", () => {
  it("name + uuid validation", () => {
    expect(updateCampaignTool.name).toBe("update_campaign");
    expect(() => updateCampaignTool.inputSchema.parse({ campaign_id: "x" })).toThrow();
  });

  it("forwards only supplied optional fields", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await updateCampaignTool.handler(
      { campaign_id: CID, name: "new", schedule_enabled: false },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateCampaign") throw new Error("wrong");
    expect(call.id).toBe(CID);
    expect(Object.keys(call.body).sort()).toEqual(["name", "schedule_enabled"]);
  });

  it("forwards null policy_set_id to clear", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await updateCampaignTool.handler({ campaign_id: CID, policy_set_id: null }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "updateCampaign") throw new Error("wrong");
    expect(call.body.policy_set_id).toBeNull();
  });

  it("forwards labels and country_codes", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await updateCampaignTool.handler(
      { campaign_id: CID, country_codes: ["US"], labels: { k: "v" } },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateCampaign") throw new Error("wrong");
    expect(call.body.country_codes).toEqual(["US"]);
    expect(call.body.labels).toEqual({ k: "v" });
  });

  it("forwards target, group, emulator, proxy and schedule fields", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await updateCampaignTool.handler(
      {
        campaign_id: CID,
        url: "https://new.example",
        ad_tag: "<i/>",
        group_id: "00000000-0000-0000-0000-000000000111",
        emulator_categories: [],
        emulator_specific_ids: ["samsung_galaxy_s23_ultra_android16"],
        emulator_mode: "random",
        proxy_type: "mobile",
        schedule_type: "weekly",
        schedule_weekly: { "0": [9, 17] },
        schedule_timezone: "Europe/Berlin",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateCampaign") throw new Error("wrong");
    expect(call.body.url).toBe("https://new.example");
    expect(call.body.ad_tag).toBe("<i/>");
    expect(call.body.group_id).toBe("00000000-0000-0000-0000-000000000111");
    expect(call.body.emulator_categories).toEqual([]);
    expect(call.body.emulator_specific_ids).toEqual(["samsung_galaxy_s23_ultra_android16"]);
    expect(call.body.emulator_mode).toBe("random");
    expect(call.body.proxy_type).toBe("mobile");
    expect(call.body.schedule_weekly).toEqual({ "0": [9, 17] });
    expect(call.body.schedule_timezone).toBe("Europe/Berlin");
  });

  it("rejects invalid emulator_mode / proxy_type / schedule_type", () => {
    expect(() =>
      updateCampaignTool.inputSchema.parse({ campaign_id: CID, emulator_mode: "x" })
    ).toThrow();
    expect(() =>
      updateCampaignTool.inputSchema.parse({ campaign_id: CID, proxy_type: "datacenter" })
    ).toThrow();
    expect(() =>
      updateCampaignTool.inputSchema.parse({ campaign_id: CID, schedule_type: "monthly" })
    ).toThrow();
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateCampaign = err(makeApiError("not-found", "x"));
    const ctx = makeToolContext({ api });
    expect((await updateCampaignTool.handler({ campaign_id: CID }, ctx)).isErr()).toBe(true);
  });
});
