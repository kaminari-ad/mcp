import { describe, expect, it } from "vitest";

import {
  parseCampaign,
  parseCampaignPage,
} from "../../../../../src/infrastructure/api/parsers/parse-campaign.js";

const VALID = {
  id: "00000000-0000-0000-0000-000000000ccc",
  name: "X",
  campaign_type: "url",
  url: "https://x.com",
  ad_tag: null,
  country_codes: ["US"],
  group_id: "00000000-0000-0000-0000-000000000111",
  emulator_selection: { categories: ["android_phone"], specific_ids: [], mode: "random" },
  proxy_type: "residential",
  proxy_region: "",
  proxy_city: "",
  proxy_isp: "",
  labels: { k: "v" },
  policy_set_id: null,
  schedule_enabled: false,
  schedule_type: null,
  schedule_weekly: null,
  schedule_interval_seconds: null,
  schedule_timezone: null,
  is_archived: false,
  created_at: "2026-01-01T00:00:00Z",
  last_run_at: null,
};

describe("parseCampaign", () => {
  it("Ok valid", () => {
    expect(parseCampaign(VALID).isOk()).toBe(true);
  });
  it("surfaces emulator_selection + proxy config", () => {
    const c = parseCampaign(VALID)._unsafeUnwrap();
    expect(c.emulator_selection.mode).toBe("random");
    expect(c.emulator_selection.categories).toEqual(["android_phone"]);
    expect(c.proxy_type).toBe("residential");
  });
  it("rejects on missing required (id)", () => {
    const { id: _omit, ...rest } = VALID;
    expect(parseCampaign(rest).isErr()).toBe(true);
  });
  it("rejects non-uuid id", () => {
    expect(parseCampaign({ ...VALID, id: "not-uuid" }).isErr()).toBe(true);
  });
  it("surfaces the referrer every scan of the campaign runs from", () => {
    const c = parseCampaign({
      ...VALID,
      referrer: "https://publisher.example/watch",
    })._unsafeUnwrap();
    expect(c.referrer).toBe("https://publisher.example/watch");
  });
  it("accepts a null referrer and an absent one alike", () => {
    expect(parseCampaign({ ...VALID, referrer: null })._unsafeUnwrap().referrer).toBeNull();
    expect(parseCampaign(VALID)._unsafeUnwrap().referrer ?? null).toBeNull();
  });
  it("surfaces vast_tag for vast-type campaigns", () => {
    const c = parseCampaign({
      ...VALID,
      campaign_type: "vast",
      url: "",
      vast_tag: "https://ad.server/vast?id=1",
    })._unsafeUnwrap();
    expect(c.campaign_type).toBe("vast");
    expect(c.vast_tag).toBe("https://ad.server/vast?id=1");
  });
  it("keeps the repeat / retry settings through the pick whitelist", () => {
    const c = parseCampaign({
      ...VALID,
      repeat_count: 4,
      repeat_mode: "shared",
      retry_max_attempts: 3,
    })._unsafeUnwrap();
    expect(c.repeat_count).toBe(4);
    expect(c.repeat_mode).toBe("shared");
    expect(c.retry_max_attempts).toBe(3);
  });
  it("defaults repeat_count / retry_max_attempts for an untouched campaign", () => {
    const c = parseCampaign(VALID)._unsafeUnwrap();
    expect(c.repeat_count).toBe(1);
    expect(c.retry_max_attempts).toBe(0);
  });
  it("defaults repeat_mode rather than leaving it undefined", () => {
    // openapi-zod-client drops the openapi `default` from a $ref'd enum,
    // so an omitted repeat_mode would otherwise reach the agent as
    // `undefined` behind a port field typed as always-present.
    const c = parseCampaign(VALID)._unsafeUnwrap();
    expect(c.repeat_mode).toBe("isolated");
  });
  it("defaults repeat_mode on every row of a page", () => {
    const page = parseCampaignPage({
      items: [VALID],
      total: 1,
      page: 1,
      limit: 50,
    })._unsafeUnwrap();
    expect(page.items[0]?.repeat_mode).toBe("isolated");
  });
  it("rejects an unknown repeat_mode", () => {
    expect(parseCampaign({ ...VALID, repeat_mode: "session" }).isErr()).toBe(true);
  });
  it("keeps the ad cap, which the generated schema does not know about yet", () => {
    // Extended onto the pick rather than picked: `.strip()` would drop it,
    // and the agent would read an ad-discovery campaign whose cap is
    // invisible right after setting it.
    const c = parseCampaign({
      ...VALID,
      campaign_type: "ad_discovery",
      max_discovered_ads: 25,
    })._unsafeUnwrap();
    expect(c.max_discovered_ads).toBe(25);
  });
  it("accepts a null ad cap and an absent one alike", () => {
    expect(
      parseCampaign({ ...VALID, max_discovered_ads: null })._unsafeUnwrap().max_discovered_ads
    ).toBeNull();
    expect(parseCampaign(VALID)._unsafeUnwrap().max_discovered_ads ?? null).toBeNull();
  });
  it("rejects a non-integer ad cap rather than passing it through", () => {
    expect(parseCampaign({ ...VALID, max_discovered_ads: 12.5 }).isErr()).toBe(true);
  });
  it("keeps the leading-domain skip, which the generated schema does not know yet", () => {
    // Same reason as the ad cap: `.strip()` would drop it and the agent would
    // read back a campaign whose skip is invisible right after setting it.
    const c = parseCampaign({ ...VALID, ignore_first_n_domains: 2 })._unsafeUnwrap();
    expect(c.ignore_first_n_domains).toBe(2);
  });
  it("leaves the skip undefined when the api does not send it", () => {
    // Not defaulted to 0: an api that predates the field cannot say, and a
    // fabricated 0 would read as "this campaign skips nothing".
    expect(parseCampaign(VALID)._unsafeUnwrap().ignore_first_n_domains).toBeUndefined();
  });
  it("rejects a non-integer skip rather than passing it through", () => {
    expect(parseCampaign({ ...VALID, ignore_first_n_domains: 1.5 }).isErr()).toBe(true);
  });
});

describe("parseCampaignPage", () => {
  it("Ok valid envelope", () => {
    const r = parseCampaignPage({ items: [VALID], total: 1, page: 1, limit: 50 });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().items).toHaveLength(1);
  });
  it("Ok empty", () => {
    expect(parseCampaignPage({ items: [], total: 0, page: 1, limit: 50 }).isOk()).toBe(true);
  });
  it("rejects bad envelope", () => {
    expect(parseCampaignPage({}).isErr()).toBe(true);
  });
});
