import { describe, expect, it } from "vitest";

import { createCampaignTool } from "../../../../src/application/tools/campaigns/create-campaign.tool.js";
import {
  createFakeApiGateway,
  DEFAULT_CAMPAIGN,
  err,
  makeApiError,
  ok,
} from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createCampaignTool", () => {
  it("name + name length validation", () => {
    expect(createCampaignTool.name).toBe("create_campaign");
    expect(() =>
      createCampaignTool.inputSchema.parse({
        name: "",
        campaign_type: "url",
        country_codes: ["US"],
      })
    ).toThrow();
  });

  it("forwards full body and returns campaign", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const r = await createCampaignTool.handler(
      {
        name: "X",
        campaign_type: "url",
        url: "https://x.com",
        country_codes: ["US", "DE"],
        group_id: "00000000-0000-0000-0000-000000000111",
        emulator_categories: ["desktop"],
        labels: { env: "prod" },
        policy_set_id: "00000000-0000-0000-0000-000000000222",
        schedule_enabled: true,
      },
      ctx
    );
    expect(r.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(call.body.name).toBe("X");
    expect(call.body.url).toBe("https://x.com");
    expect(call.body.schedule_enabled).toBe(true);
  });

  it("omits all optionals when not supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCampaignTool.handler(
      { name: "Y", campaign_type: "ad_tag", ad_tag: "<i/>", country_codes: ["US"] },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(Object.keys(call.body).sort()).toEqual(
      ["ad_tag", "campaign_type", "country_codes", "name"].sort()
    );
  });

  it("forwards explicit null policy_set_id so the org default is skipped", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCampaignTool.handler(
      {
        name: "Y",
        campaign_type: "url",
        url: "https://y.com",
        country_codes: ["US"],
        policy_set_id: null,
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(call.body.policy_set_id).toBeNull();
  });

  it("forwards emulator + proxy + schedule config", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCampaignTool.handler(
      {
        name: "Z",
        campaign_type: "url",
        url: "https://z.com",
        country_codes: ["US"],
        emulator_categories: [],
        emulator_specific_ids: ["samsung_galaxy_s23_ultra_android16"],
        emulator_mode: "all",
        proxy_type: "mobile",
        proxy_region: "CA",
        schedule_type: "interval",
        schedule_interval_seconds: 3600,
        schedule_timezone: "UTC",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(call.body.emulator_categories).toEqual([]);
    expect(call.body.emulator_specific_ids).toEqual(["samsung_galaxy_s23_ultra_android16"]);
    expect(call.body.emulator_mode).toBe("all");
    expect(call.body.proxy_type).toBe("mobile");
    expect(call.body.proxy_region).toBe("CA");
    expect(call.body.schedule_type).toBe("interval");
    expect(call.body.schedule_interval_seconds).toBe(3600);
    expect(call.body.schedule_timezone).toBe("UTC");
  });

  it("accepts a vast campaign type and forwards vast_tag", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const r = await createCampaignTool.handler(
      {
        name: "Preroll",
        campaign_type: "vast",
        vast_tag: "https://ad.server/vast?id=1",
        country_codes: ["US"],
      },
      ctx
    );
    expect(r.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(call.body.campaign_type).toBe("vast");
    expect(call.body.vast_tag).toBe("https://ad.server/vast?id=1");
  });

  it("accepts an ad_discovery campaign type and forwards url", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const r = await createCampaignTool.handler(
      {
        name: "Publisher page",
        campaign_type: "ad_discovery",
        url: "https://publisher.example/article",
        country_codes: ["DE"],
      },
      ctx
    );
    expect(r.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(call.body.campaign_type).toBe("ad_discovery");
    expect(call.body.url).toBe("https://publisher.example/article");
  });

  it("forwards the repeat / retry trio and echoes the campaign's settings back", async () => {
    const api = createFakeApiGateway();
    // The tool's description tells the agent to read the settings back off
    // the response, so the fake must answer with what was sent — asserting
    // on the fake's untouched defaults would pass even if the tool dropped
    // the fields on the floor.
    api.state.responses.createCampaign = ok({
      ...DEFAULT_CAMPAIGN,
      repeat_count: 3,
      repeat_mode: "shared",
      retry_max_attempts: 2,
    });
    const ctx = makeToolContext({ api });
    const r = await createCampaignTool.handler(
      {
        name: "Cloaker hunt",
        campaign_type: "url",
        url: "https://x.com",
        country_codes: ["US"],
        repeat_count: 3,
        repeat_mode: "shared",
        retry_max_attempts: 2,
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(call.body.repeat_count).toBe(3);
    expect(call.body.repeat_mode).toBe("shared");
    expect(call.body.retry_max_attempts).toBe(2);
    const campaign = r._unsafeUnwrap();
    expect(campaign.repeat_count).toBe(3);
    expect(campaign.repeat_mode).toBe("shared");
    expect(campaign.retry_max_attempts).toBe(2);
  });

  it("leaves the shared + ad_discovery 422 to the API", async () => {
    // Deliberate: MCP does not pre-validate the pairing. The API owns the
    // rule (it also fires on update, where campaign_type is immutable), and
    // duplicating it here would drift the moment the API relaxes it.
    const api = createFakeApiGateway();
    const input = {
      name: "Publisher page",
      campaign_type: "ad_discovery" as const,
      url: "https://publisher.example/article",
      country_codes: ["DE"],
      repeat_mode: "shared" as const,
      repeat_count: 2,
    };
    expect(() => createCampaignTool.inputSchema.parse(input)).not.toThrow();
    await createCampaignTool.handler(input, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(call.body.repeat_mode).toBe("shared");
  });

  it("rejects an out-of-range repeat_count at validation", () => {
    const base = {
      name: "X",
      campaign_type: "url",
      url: "https://x.com",
      country_codes: ["US"],
    };
    expect(() => createCampaignTool.inputSchema.parse({ ...base, repeat_count: 21 })).toThrow();
    expect(() =>
      createCampaignTool.inputSchema.parse({ ...base, retry_max_attempts: 6 })
    ).toThrow();
    expect(() =>
      createCampaignTool.inputSchema.parse({ ...base, repeat_mode: "session" })
    ).toThrow();
  });

  it("rejects an invalid campaign_type at validation", () => {
    expect(() =>
      createCampaignTool.inputSchema.parse({
        name: "X",
        campaign_type: "banner",
        country_codes: ["US"],
      })
    ).toThrow();
  });

  it("rejects an invalid emulator_mode at validation", () => {
    expect(() =>
      createCampaignTool.inputSchema.parse({
        name: "X",
        campaign_type: "url",
        url: "https://x.com",
        country_codes: ["US"],
        emulator_mode: "sometimes",
      })
    ).toThrow();
  });

  it("forwards referrer — the publisher page a vast tag is embedded in", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCampaignTool.handler(
      {
        name: "Preroll",
        campaign_type: "vast",
        vast_tag: "https://ad.server/vast?id=1",
        country_codes: ["US"],
        referrer: "https://publisher.example/watch",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect(call.body.referrer).toBe("https://publisher.example/watch");
  });

  it("omits the referrer key entirely when the input leaves it unset", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCampaignTool.handler(
      { name: "Y", campaign_type: "url", url: "https://x.com", country_codes: ["US"] },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCampaign") throw new Error("wrong");
    expect("referrer" in call.body).toBe(false);
  });

  it("rejects a referrer the API would 422", () => {
    for (const referrer of [
      "publisher.example",
      "javascript:alert(1)",
      "file:///etc/passwd",
      "data:text/html,<b>x",
      `https://publisher.example/${"a".repeat(2048)}`,
    ]) {
      expect(() =>
        createCampaignTool.inputSchema.parse({
          name: "X",
          campaign_type: "url",
          url: "https://x.com",
          country_codes: ["US"],
          referrer,
        })
      ).toThrow();
    }
  });

  it("rejects a null referrer on create — only update can clear one", () => {
    expect(() =>
      createCampaignTool.inputSchema.parse({
        name: "X",
        campaign_type: "url",
        url: "https://x.com",
        country_codes: ["US"],
        referrer: null,
      })
    ).toThrow();
  });

  it("maps invalid-input error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createCampaign = err(makeApiError("invalid-input", "bad"));
    const ctx = makeToolContext({ api });
    expect(
      (
        await createCampaignTool.handler(
          { name: "X", campaign_type: "url", url: "https://x.com", country_codes: ["US"] },
          ctx
        )
      ).isErr()
    ).toBe(true);
  });
});
