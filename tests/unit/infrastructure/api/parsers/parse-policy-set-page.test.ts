import { describe, expect, it } from "vitest";

import { parsePolicySetPage } from "../../../../../src/infrastructure/api/parsers/parse-policy-set-page.js";

const UUID_PS = "00000000-0000-0000-0000-000000000ddd";
const UUID_ORG = "00000000-0000-0000-0000-000000000010";

const VALID_ITEM = {
  id: UUID_PS,
  name: "Default",
  description: "Org's default policy set",
  organization_id: UUID_ORG,
  visibility: "private",
  is_approved: true,
  is_default: false,
  created_at: "2026-05-01T00:00:00Z",
};

const ENVELOPE = (items: unknown[], total = items.length, page = 1, limit = 50) => ({
  items,
  total,
  page,
  limit,
  pages: 1,
});

describe("parsePolicySetPage", () => {
  it("Ok on valid envelope", () => {
    const r = parsePolicySetPage(ENVELOPE([VALID_ITEM]));
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.items[0]?.name).toBe("Default");
    expect(v.total).toBe(1);
  });

  it("preserves pagination metadata across pages", () => {
    const r = parsePolicySetPage(ENVELOPE([VALID_ITEM], 42, 2, 20));
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.total).toBe(42);
    expect(v.page).toBe(2);
    expect(v.limit).toBe(20);
  });

  it("strips `entries` if API ever leaks them into list items", () => {
    const r = parsePolicySetPage(ENVELOPE([{ ...VALID_ITEM, entries: [{ tag_slug: "x" }] }]));
    expect(r.isOk()).toBe(true);
    const item = r._unsafeUnwrap().items[0];
    expect(item).toBeDefined();
    expect((item as Record<string, unknown>)["entries"]).toBeUndefined();
  });

  it("rejects items with non-uuid id", () => {
    expect(parsePolicySetPage(ENVELOPE([{ ...VALID_ITEM, id: "nope" }])).isErr()).toBe(true);
  });

  it("rejects bare array", () => {
    expect(parsePolicySetPage([VALID_ITEM]).isErr()).toBe(true);
  });

  it("Ok on empty envelope", () => {
    expect(parsePolicySetPage(ENVELOPE([], 0)).isOk()).toBe(true);
  });

  // Envelope-shape symmetry with `parse-custom-rule-page.test.ts` —
  // missing `total` should fail (FastAPI always emits it).
  it("rejects when envelope misses total", () => {
    expect(parsePolicySetPage({ items: [VALID_ITEM], page: 1, limit: 50 }).isErr()).toBe(true);
  });

  it("rejects when items is missing", () => {
    expect(parsePolicySetPage({ total: 0, page: 1, limit: 50 }).isErr()).toBe(true);
  });
});
