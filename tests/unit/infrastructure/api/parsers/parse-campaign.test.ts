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
  schedule_type: null,
  is_archived: false,
  created_at: "2026-01-01T00:00:00Z",
  last_run_at: null,
};

describe("parseCampaign", () => {
  it("Ok valid", () => {
    expect(parseCampaign(VALID).isOk()).toBe(true);
  });
  it("rejects on missing required (id)", () => {
    const { id: _omit, ...rest } = VALID;
    expect(parseCampaign(rest).isErr()).toBe(true);
  });
  it("rejects non-uuid id", () => {
    expect(parseCampaign({ ...VALID, id: "not-uuid" }).isErr()).toBe(true);
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
