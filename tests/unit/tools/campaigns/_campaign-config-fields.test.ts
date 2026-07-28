import { describe, expect, it } from "vitest";

import {
  campaignConfigFields,
  pickCampaignConfigBody,
} from "../../../../src/application/tools/campaigns/_campaign-config-fields.js";

describe("pickCampaignConfigBody", () => {
  it("returns every config field when all are supplied", () => {
    const body = pickCampaignConfigBody({
      emulator_categories: ["android_phone"],
      emulator_specific_ids: ["samsung_galaxy_s23_ultra_android16"],
      emulator_mode: "all",
      proxy_type: "mobile",
      proxy_region: "CA",
      proxy_city: "LA",
      proxy_isp: "att",
      repeat_count: 3,
      repeat_mode: "shared",
      retry_max_attempts: 2,
      schedule_type: "interval",
      schedule_weekly: { "0": [9] },
      schedule_interval_seconds: 3600,
      schedule_timezone: "UTC",
    });
    expect(Object.keys(body).sort()).toEqual(
      [
        "emulator_categories",
        "emulator_specific_ids",
        "emulator_mode",
        "proxy_type",
        "proxy_region",
        "proxy_city",
        "proxy_isp",
        "repeat_count",
        "repeat_mode",
        "retry_max_attempts",
        "schedule_type",
        "schedule_weekly",
        "schedule_interval_seconds",
        "schedule_timezone",
      ].sort()
    );
    expect(body.schedule_weekly).toEqual({ "0": [9] });
    expect(body.repeat_mode).toBe("shared");
  });

  it("returns an empty object when nothing is supplied", () => {
    expect(pickCampaignConfigBody({})).toEqual({});
  });

  it("forwards the repeat / retry trio independently of the emulator block", () => {
    expect(pickCampaignConfigBody({ repeat_count: 7 })).toEqual({ repeat_count: 7 });
    expect(pickCampaignConfigBody({ retry_max_attempts: 0 })).toEqual({ retry_max_attempts: 0 });
  });
});

describe("campaignConfigFields", () => {
  it("exposes the repeat / retry trio to both campaign tools", () => {
    expect(Object.keys(campaignConfigFields)).toContain("repeat_count");
    expect(Object.keys(campaignConfigFields)).toContain("repeat_mode");
    expect(Object.keys(campaignConfigFields)).toContain("retry_max_attempts");
  });
});
