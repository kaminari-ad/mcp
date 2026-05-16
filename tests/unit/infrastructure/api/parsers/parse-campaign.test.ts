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
  labels: { k: "v" },
  policy_set_id: null,
  schedule_enabled: false,
  is_archived: false,
  created_at: "2026-01-01T00:00:00Z",
  last_run_at: null,
};

describe("parseCampaign", () => {
  it("Ok valid", () => {
    expect(parseCampaign(VALID).isOk()).toBe(true);
  });

  it("rejects non-object", () => {
    expect(parseCampaign("s").isErr()).toBe(true);
  });

  it("rejects when id missing", () => {
    const { id: _omit, ...withoutId } = VALID;
    expect(parseCampaign(withoutId).isErr()).toBe(true);
  });

  it("rejects when group_id missing", () => {
    const { group_id: _omit, ...withoutGroup } = VALID;
    expect(parseCampaign(withoutGroup).isErr()).toBe(true);
  });

  it("defaults non-string scalar fields", () => {
    const r = parseCampaign({ ...VALID, name: 42, schedule_enabled: "x" });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().name).toBe("");
    expect(r._unsafeUnwrap().schedule_enabled).toBe(false);
  });

  it("filters non-string country_codes entries", () => {
    const r = parseCampaign({ ...VALID, country_codes: ["US", 42, "DE"] });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().country_codes).toEqual(["US", "DE"]);
  });

  it("treats non-array country_codes as empty", () => {
    const r = parseCampaign({ ...VALID, country_codes: "not-array" });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().country_codes).toEqual([]);
  });

  it("treats non-object labels as empty", () => {
    const r = parseCampaign({ ...VALID, labels: "x" });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().labels).toEqual({});
  });

  it("filters non-string label values", () => {
    const r = parseCampaign({ ...VALID, labels: { keep: "y", drop: 1 } });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().labels).toEqual({ keep: "y" });
  });

  it("handles non-null non-string policy_set_id as null", () => {
    const r = parseCampaign({ ...VALID, policy_set_id: 5 });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().policy_set_id).toBeNull();
  });
});

describe("parseCampaignPage", () => {
  it("Ok valid", () => {
    expect(parseCampaignPage({ items: [VALID], total: 1, page: 1, limit: 50 }).isOk()).toBe(true);
  });

  it("rejects non-object", () => {
    expect(parseCampaignPage("s").isErr()).toBe(true);
  });

  it("rejects bad envelope", () => {
    expect(parseCampaignPage({ items: "x", total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
  });

  it("rejects bad item", () => {
    expect(
      parseCampaignPage({ items: [{ no: "id" }], total: 1, page: 1, limit: 50 }).isErr()
    ).toBe(true);
  });
});
