import { describe, expect, it } from "vitest";

import {
  parseCampaignGroup,
  parseCampaignGroupPage,
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

describe("parseCampaignGroupPage", () => {
  it("Ok valid", () => {
    expect(parseCampaignGroupPage({ items: [VALID], total: 1, page: 1, limit: 50 }).isOk()).toBe(
      true
    );
  });

  it("rejects bad envelope", () => {
    expect(parseCampaignGroupPage("x").isErr()).toBe(true);
    expect(parseCampaignGroupPage({ items: "x", total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
    expect(
      parseCampaignGroupPage({ items: [{ no: "id" }], total: 1, page: 1, limit: 50 }).isErr()
    ).toBe(true);
  });
});
