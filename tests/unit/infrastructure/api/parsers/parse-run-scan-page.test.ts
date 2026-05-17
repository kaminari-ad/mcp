import { describe, expect, it } from "vitest";

import { parseRunScanPage } from "../../../../../src/infrastructure/api/parsers/parse-run-scan-page.js";

const UUID_A = "00000000-0000-0000-0000-000000000bbb";

const VALID_TILE = {
  id: UUID_A,
  country_code: "US",
  status: "completed",
  offer_url: "https://offer.example",
  screenshot_url: "/api/v1/scans/.../screenshot",
  elapsed_ms: 1234,
  error: "",
};

const ENVELOPE = (items: unknown[], total = items.length) => ({
  items,
  total,
  page: 1,
  limit: 50,
  pages: 1,
});

describe("parseRunScanPage", () => {
  it("Ok on valid envelope with one tile", () => {
    const r = parseRunScanPage(ENVELOPE([VALID_TILE]));
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.items[0]?.country_code).toBe("US");
    expect(v.items[0]?.status).toBe("completed");
    expect(v.total).toBe(1);
    expect(v.page).toBe(1);
    expect(v.limit).toBe(50);
  });

  it("Ok on empty envelope", () => {
    const r = parseRunScanPage(ENVELOPE([], 0));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().items).toEqual([]);
  });

  it("rejects items with non-uuid id", () => {
    const r = parseRunScanPage(ENVELOPE([{ ...VALID_TILE, id: "not-a-uuid" }]));
    expect(r.isErr()).toBe(true);
    if (r.isErr()) {
      expect(r.error.kind).toBe("upstream");
      expect(r.error.detail).toContain("items.0.id");
    }
  });

  it("rejects envelope without items key", () => {
    const r = parseRunScanPage({ total: 0, page: 1, limit: 50 });
    expect(r.isErr()).toBe(true);
  });

  it("rejects bare array (endpoint always uses envelope)", () => {
    const r = parseRunScanPage([VALID_TILE]);
    expect(r.isErr()).toBe(true);
  });

  it("strips extra fields the API may add later", () => {
    const r = parseRunScanPage(ENVELOPE([{ ...VALID_TILE, future_field: "ignored" }]));
    expect(r.isOk()).toBe(true);
    const item = r._unsafeUnwrap().items[0];
    expect(item).toBeDefined();
    expect((item as Record<string, unknown>)["future_field"]).toBeUndefined();
  });

  // Guard against a future `.strict()` regression: a payload that
  // ALSO carries the `ScanBriefResponse`-shaped extras (`url`,
  // `created_at`, `labels`, `campaign_id`, `is_ad_tag`) must still
  // parse Ok — the tile schema only REQUIRES the slim fields, extras
  // are dropped by `.strip()`. The v0.1.5 bug was the inverse:
  // requiring `url` from a tile payload. This test pins both halves.
  it("accepts payloads with ScanBrief-shaped extras (strips them)", () => {
    const r = parseRunScanPage(
      ENVELOPE([
        {
          ...VALID_TILE,
          url: "https://input.example/ad",
          created_at: "2026-05-17T12:00:00Z",
          labels: { source: "manual" },
          campaign_id: "00000000-0000-0000-0000-000000000ccc",
          campaign_name: "test",
          is_ad_tag: false,
        },
      ])
    );
    expect(r.isOk()).toBe(true);
    const item = r._unsafeUnwrap().items[0];
    expect(item).toBeDefined();
    expect((item as Record<string, unknown>)["url"]).toBeUndefined();
    expect((item as Record<string, unknown>)["labels"]).toBeUndefined();
    expect((item as Record<string, unknown>)["campaign_id"]).toBeUndefined();
  });
});
