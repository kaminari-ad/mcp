import { describe, expect, it } from "vitest";

import { parseScanPage } from "../../../../../src/infrastructure/api/parsers/parse-scan-page.js";

const VALID_BRIEF = {
  id: "00000000-0000-0000-0000-000000000bbb",
  url: "https://example.com/landing",
  country_code: "US",
  status: "completed",
  offer_url: "https://example.com/offer",
  screenshot_url:
    "https://app.kaminari.ad/api/v1/scans/00000000-0000-0000-0000-000000000bbb/screenshot?w=400",
  report_url: "https://app.kaminari.ad/scans/00000000-0000-0000-0000-000000000bbb",
  public_report_url: "https://app.kaminari.ad/public/scans/00000000-0000-0000-0000-000000000bbb",
  labels: { campaign: "spring" },
  elapsed_ms: 1234,
  campaign_id: "00000000-0000-0000-0000-000000000ccc",
  campaign_name: "Spring",
  is_ad_tag: false,
  created_at: "2026-05-17T00:00:00Z",
};

describe("parseScanPage", () => {
  it("Ok valid envelope with one item", () => {
    const r = parseScanPage({
      items: [VALID_BRIEF],
      total: 1,
      page: 1,
      limit: 50,
    });
    expect(r.isOk()).toBe(true);
    const items = r._unsafeUnwrap().items;
    expect(items).toHaveLength(1);
    expect(items[0]?.report_url).toBe(
      "https://app.kaminari.ad/scans/00000000-0000-0000-0000-000000000bbb"
    );
    expect(items[0]?.public_report_url).toBe(
      "https://app.kaminari.ad/public/scans/00000000-0000-0000-0000-000000000bbb"
    );
  });
  it("Ok empty envelope", () => {
    const r = parseScanPage({ items: [], total: 0, page: 1, limit: 50 });
    expect(r.isOk()).toBe(true);
  });
  it("Ok with null nullable fields (campaign_id, campaign_name)", () => {
    const r = parseScanPage({
      items: [
        {
          ...VALID_BRIEF,
          campaign_id: null,
          campaign_name: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    });
    expect(r._unsafeUnwrap().items[0]?.campaign_id).toBeNull();
  });
  it("rejects bad envelope shape", () => {
    expect(parseScanPage({ items: "x", total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
    expect(parseScanPage({}).isErr()).toBe(true);
  });
  it("rejects when item is malformed", () => {
    expect(
      parseScanPage({ items: [{ id: "not-uuid" }], total: 1, page: 1, limit: 50 }).isErr()
    ).toBe(true);
  });
  it("surfaces is_vast for VAST scans", () => {
    const r = parseScanPage({
      items: [{ ...VALID_BRIEF, url: "", is_ad_tag: false, is_vast: true }],
      total: 1,
      page: 1,
      limit: 50,
    });
    expect(r._unsafeUnwrap().items[0]?.is_vast).toBe(true);
  });
  it("surfaces ad-discovery child fields through the real parser", () => {
    const r = parseScanPage({
      items: [
        {
          ...VALID_BRIEF,
          url: "",
          parent_scan_id: "00000000-0000-0000-0000-0000000000aa",
          ad_discovery: false,
          slot_index: 0,
          ad_kind: "banner",
          network: "ExoClick",
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    });
    const item = r._unsafeUnwrap().items[0];
    expect(item?.parent_scan_id).toBe("00000000-0000-0000-0000-0000000000aa");
    expect(item?.ad_kind).toBe("banner");
    expect(item?.network).toBe("ExoClick");
    expect(item?.slot_index).toBe(0);
  });
  it("keeps the repeat / retry block through the pick whitelist", () => {
    const r = parseScanPage({
      items: [
        {
          ...VALID_BRIEF,
          repeat_index: 1,
          repeat_total: 3,
          repeat_session_id: "00000000-0000-0000-0000-0000000005e5",
          retry_attempt: 2,
          retry_max_attempts: 4,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    });
    const item = r._unsafeUnwrap().items[0];
    expect(item?.repeat_index).toBe(1);
    expect(item?.repeat_total).toBe(3);
    expect(item?.repeat_session_id).toBe("00000000-0000-0000-0000-0000000005e5");
    expect(item?.retry_attempt).toBe(2);
    expect(item?.retry_max_attempts).toBe(4);
  });
  it("defaults the repeat / retry block for a plain single scan", () => {
    const r = parseScanPage({ items: [VALID_BRIEF], total: 1, page: 1, limit: 50 });
    const item = r._unsafeUnwrap().items[0];
    expect(item?.repeat_index).toBe(0);
    expect(item?.repeat_total).toBe(1);
    expect(item?.repeat_session_id ?? null).toBeNull();
    expect(item?.retry_attempt).toBe(0);
  });
});
