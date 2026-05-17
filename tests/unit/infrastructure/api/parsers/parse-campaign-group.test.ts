import { describe, expect, it } from "vitest";

import {
  parseCampaignGroup,
  parseCampaignGroupArray,
} from "../../../../../src/infrastructure/api/parsers/parse-campaign-group.js";

const VALID = {
  id: "00000000-0000-0000-0000-000000000111",
  name: "default",
  is_default: true,
  is_archived: false,
  schedule_paused: false,
  created_at: "2026-01-01T00:00:00Z",
  campaign_count: 3,
};

describe("parseCampaignGroup", () => {
  it("Ok valid", () => {
    expect(parseCampaignGroup(VALID).isOk()).toBe(true);
  });

  it("rejects non-object / no id", () => {
    expect(parseCampaignGroup("x").isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID;
    expect(parseCampaignGroup(withoutId).isErr()).toBe(true);
  });

  it("defaults non-bool flags", () => {
    const r = parseCampaignGroup({ ...VALID, is_default: "x", schedule_paused: "y" });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().is_default).toBe(false);
    expect(r._unsafeUnwrap().schedule_paused).toBe(false);
  });

  it("treats null campaign_count as null", () => {
    const r = parseCampaignGroup({ ...VALID, campaign_count: null });
    expect(r._unsafeUnwrap().campaign_count).toBeNull();
  });

  it("treats non-number non-null campaign_count as null", () => {
    const r = parseCampaignGroup({ ...VALID, campaign_count: "x" });
    expect(r._unsafeUnwrap().campaign_count).toBeNull();
  });
});

describe("parseCampaignGroupArray", () => {
  it("Ok valid bare array (current OpenAPI contract)", () => {
    const r = parseCampaignGroupArray([VALID]);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toHaveLength(1);
  });

  it("Ok valid paginated envelope (defensive fallback if API ever wraps)", () => {
    const r = parseCampaignGroupArray({
      items: [VALID],
      total: 1,
      page: 1,
      limit: 50,
      pages: 1,
    });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toHaveLength(1);
  });

  it("Ok empty paginated envelope", () => {
    const r = parseCampaignGroupArray({ items: [], total: 0, page: 1, limit: 50, pages: 0 });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual([]);
  });

  it("rejects garbage (neither array nor envelope)", () => {
    expect(parseCampaignGroupArray("x").isErr()).toBe(true);
    expect(parseCampaignGroupArray({ items: "not-an-array" }).isErr()).toBe(true);
    expect(parseCampaignGroupArray(42).isErr()).toBe(true);
  });

  it("rejects when an item is malformed", () => {
    expect(parseCampaignGroupArray([{ no: "id" }]).isErr()).toBe(true);
    expect(parseCampaignGroupArray({ items: [{ no: "id" }] }).isErr()).toBe(true);
  });
});
