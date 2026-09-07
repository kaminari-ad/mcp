import { describe, expect, it } from "vitest";
import { z } from "zod";

import { maxDiscoveredAdsField } from "../../../../src/application/tools/_shared/max-discovered-ads-field.js";

const Schema = z.object({ max_discovered_ads: maxDiscoveredAdsField });

describe("maxDiscoveredAdsField", () => {
  it("accepts the full documented range", () => {
    expect(Schema.parse({ max_discovered_ads: 1 }).max_discovered_ads).toBe(1);
    expect(Schema.parse({ max_discovered_ads: 25 }).max_discovered_ads).toBe(25);
  });

  it("rejects a value the crawler's deadline could not fund", () => {
    // 25 is (ad_discovery_max_timeout_s - base) // per_ad in the crawler, and
    // its task consumer clamps anything higher. Stopping 26 here turns a
    // silently narrowed scan into an argument error the agent can read.
    expect(() => Schema.parse({ max_discovered_ads: 26 })).toThrow();
    expect(() => Schema.parse({ max_discovered_ads: 100 })).toThrow();
  });

  it("rejects a value below one ad and a fractional one", () => {
    expect(() => Schema.parse({ max_discovered_ads: 0 })).toThrow();
    expect(() => Schema.parse({ max_discovered_ads: -1 })).toThrow();
    expect(() => Schema.parse({ max_discovered_ads: 12.5 })).toThrow();
  });

  it("stays undefined when omitted so the API applies its own default", () => {
    expect(Schema.parse({})).toEqual({});
  });

  it("tells the agent that every ad found is billed separately", () => {
    const described = maxDiscoveredAdsField.description ?? "";
    expect(described).toMatch(/BILLED AS A SEPARATE CHECK/);
    expect(described).toMatch(/26 checks/);
  });

  it("tells the agent the field is refused outside ad discovery", () => {
    const described = maxDiscoveredAdsField.description ?? "";
    expect(described).toMatch(/ad_discovery/);
    expect(described).toMatch(/422/);
  });

  it("states the default so the agent can explain the unset behaviour", () => {
    expect(maxDiscoveredAdsField.description ?? "").toMatch(/Default: 12/);
  });
});
