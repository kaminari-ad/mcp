import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  maxDiscoveredAdsField,
  maxDiscoveredAdsUpdateField,
} from "../../../../src/application/tools/_shared/max-discovered-ads-field.js";

const Schema = z.object({ max_discovered_ads: maxDiscoveredAdsField });
const UpdateSchema = z.object({ max_discovered_ads: maxDiscoveredAdsUpdateField });

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

  it("names the default without presenting it as fixed", () => {
    // It is an operator setting (SCANNING__MAX_DISCOVERED_ADS), so an agent
    // told "the default is 12" full stop would report a stale number after a
    // retune.
    const described = maxDiscoveredAdsField.description ?? "";
    expect(described).toMatch(/12/);
    expect(described).toMatch(/unless an operator retuned it/);
  });

  it("rejects null on create, where there is nothing to clear", () => {
    expect(() => Schema.parse({ max_discovered_ads: null })).toThrow();
  });
});

describe("maxDiscoveredAdsUpdateField", () => {
  it("accepts null so a campaign can drop its own cap", () => {
    // Without this the field is a one-way door: a saved value would detach the
    // campaign from the platform default for good.
    expect(UpdateSchema.parse({ max_discovered_ads: null }).max_discovered_ads).toBeNull();
  });

  it("keeps the same range as the create field", () => {
    expect(UpdateSchema.parse({ max_discovered_ads: 25 }).max_discovered_ads).toBe(25);
    expect(() => UpdateSchema.parse({ max_discovered_ads: 26 })).toThrow();
    expect(() => UpdateSchema.parse({ max_discovered_ads: 0 })).toThrow();
  });

  it("tells the agent how to clear it, which is otherwise unguessable", () => {
    const described = maxDiscoveredAdsUpdateField.description ?? "";
    expect(described).toMatch(/pass null/);
    expect(described).toMatch(/leaves the campaign's current setting unchanged/);
  });

  it("does not tell the agent to OMIT the field to reach the default", () => {
    // That is create-only advice. On an update, omitting is a no-op — an agent
    // asked to reset a campaign's cap would report success having changed
    // nothing, the exact misdirection the nullable field exists to remove.
    expect(maxDiscoveredAdsUpdateField.description ?? "").not.toMatch(
      /Omit it to use the platform default/
    );
    expect(maxDiscoveredAdsField.description ?? "").toMatch(/Omit it to use the platform default/);
  });
});
