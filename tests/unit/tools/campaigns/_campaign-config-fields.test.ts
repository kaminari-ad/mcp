import { describe, expect, it } from "vitest";

import { pickCampaignConfigBody } from "../../../../src/application/tools/campaigns/_campaign-config-fields.js";

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
        "schedule_type",
        "schedule_weekly",
        "schedule_interval_seconds",
        "schedule_timezone",
      ].sort()
    );
    expect(body.schedule_weekly).toEqual({ "0": [9] });
  });

  it("returns an empty object when nothing is supplied", () => {
    expect(pickCampaignConfigBody({})).toEqual({});
  });
});
