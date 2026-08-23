import { describe, expect, it } from "vitest";

import { parseLinkedCampaignPage } from "../../../../../src/infrastructure/api/parsers/parse-linked-campaign-page.js";

const UUID_C = "00000000-0000-0000-0000-0000000000c1";

const VALID_ITEM = {
  id: UUID_C,
  name: "Holiday promo",
  is_archived: false,
};

const ENVELOPE = (items: unknown[], total = items.length, page = 1, limit = 50) => ({
  items,
  total,
  page,
  limit,
  pages: 1,
});

describe("parseLinkedCampaignPage", () => {
  it("Ok on valid envelope", () => {
    const r = parseLinkedCampaignPage(ENVELOPE([VALID_ITEM]));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().items[0]?.name).toBe("Holiday promo");
  });

  it("preserves pagination metadata across pages", () => {
    const v = parseLinkedCampaignPage(ENVELOPE([VALID_ITEM], 120, 3, 20))._unsafeUnwrap();
    expect(v.total).toBe(120);
    expect(v.page).toBe(3);
    expect(v.limit).toBe(20);
  });

  it("keeps the archived flag, which decides whether a detach is needed", () => {
    const v = parseLinkedCampaignPage(
      ENVELOPE([{ ...VALID_ITEM, is_archived: true }])
    )._unsafeUnwrap();
    expect(v.items[0]?.is_archived).toBe(true);
  });

  it("strips fields outside the projection", () => {
    const item = parseLinkedCampaignPage(
      ENVELOPE([{ ...VALID_ITEM, group_id: UUID_C }])
    )._unsafeUnwrap().items[0];
    expect((item as Record<string, unknown>)["group_id"]).toBeUndefined();
  });

  it("rejects items with non-uuid id", () => {
    expect(parseLinkedCampaignPage(ENVELOPE([{ ...VALID_ITEM, id: "nope" }])).isErr()).toBe(true);
  });

  it("rejects a bare array", () => {
    expect(parseLinkedCampaignPage([VALID_ITEM]).isErr()).toBe(true);
  });

  it("Ok on empty envelope", () => {
    expect(parseLinkedCampaignPage(ENVELOPE([], 0)).isOk()).toBe(true);
  });
});
