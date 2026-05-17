import { describe, expect, it } from "vitest";

import { parseCustomRulePage } from "../../../../../src/infrastructure/api/parsers/parse-custom-rule-page.js";

const UUID_A = "00000000-0000-0000-0000-000000000bbb";
const UUID_ORG = "00000000-0000-0000-0000-000000000010";

const VALID_RULE = {
  id: UUID_A,
  organization_id: UUID_ORG,
  name: "Ad-blocker detector",
  tag_slug: "adblock_detected",
  rule_type: "regex",
  config: { pattern: "(?i)adblock" },
  target: "page",
  is_active: true,
  created_at: "2026-05-01T00:00:00Z",
};

const ENVELOPE = (items: unknown[], total = items.length, page = 1, limit = 50) => ({
  items,
  total,
  page,
  limit,
  pages: 1,
});

describe("parseCustomRulePage", () => {
  it("Ok on valid paginated envelope", () => {
    const r = parseCustomRulePage(ENVELOPE([VALID_RULE], 1, 1, 50));
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.items[0]?.tag_slug).toBe("adblock_detected");
    expect(v.total).toBe(1);
    expect(v.page).toBe(1);
    expect(v.limit).toBe(50);
  });

  it("preserves pagination metadata across pages", () => {
    const r = parseCustomRulePage(ENVELOPE([VALID_RULE, VALID_RULE], 60, 2, 50));
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.total).toBe(60);
    expect(v.page).toBe(2);
  });

  it("Ok on empty envelope", () => {
    expect(parseCustomRulePage(ENVELOPE([], 0)).isOk()).toBe(true);
  });

  it("rejects items with non-uuid id", () => {
    const r = parseCustomRulePage(ENVELOPE([{ ...VALID_RULE, id: "nope" }]));
    expect(r.isErr()).toBe(true);
  });

  it("rejects bare array (endpoint always uses envelope)", () => {
    expect(parseCustomRulePage([VALID_RULE]).isErr()).toBe(true);
  });

  it("rejects when envelope misses total", () => {
    expect(parseCustomRulePage({ items: [VALID_RULE], page: 1, limit: 50 }).isErr()).toBe(true);
  });
});
