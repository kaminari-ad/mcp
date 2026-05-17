import { describe, expect, it } from "vitest";

import { parseCampaignPickerArray } from "../../../../../src/infrastructure/api/parsers/parse-campaign-picker.js";

const UUID_C = "00000000-0000-0000-0000-000000000ccc";
const UUID_G = "00000000-0000-0000-0000-000000000111";

const VALID_ITEM = {
  id: UUID_C,
  name: "Brand A — homepage",
  group_id: UUID_G,
  is_archived: false,
};

describe("parseCampaignPickerArray", () => {
  it("Ok on bare array of picker items", () => {
    const r = parseCampaignPickerArray([VALID_ITEM, { ...VALID_ITEM, is_archived: true }]);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toHaveLength(2);
    expect(r._unsafeUnwrap()[0]?.name).toBe("Brand A — homepage");
  });

  it("Ok on empty array", () => {
    expect(parseCampaignPickerArray([]).isOk()).toBe(true);
  });

  it("strips heavy fields the API may add (schedule/proxy/labels)", () => {
    const r = parseCampaignPickerArray([
      { ...VALID_ITEM, schedule_enabled: true, labels: { env: "prod" } },
    ]);
    expect(r.isOk()).toBe(true);
    const item = r._unsafeUnwrap()[0];
    expect(item).toBeDefined();
    expect((item as Record<string, unknown>)["schedule_enabled"]).toBeUndefined();
    expect((item as Record<string, unknown>)["labels"]).toBeUndefined();
  });

  it("rejects items with non-uuid id", () => {
    expect(parseCampaignPickerArray([{ ...VALID_ITEM, id: "nope" }]).isErr()).toBe(true);
  });

  it("rejects envelope shape (endpoint is a bare array)", () => {
    expect(parseCampaignPickerArray({ items: [VALID_ITEM] }).isErr()).toBe(true);
  });
});
