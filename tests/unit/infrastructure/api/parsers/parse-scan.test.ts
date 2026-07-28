import { describe, expect, it } from "vitest";

import {
  parseScan,
  parseScanArray,
} from "../../../../../src/infrastructure/api/parsers/parse-scan.js";

// Schema-valid fixture: openapi-zod-client treats `default` openapi
// values as required-with-default; nullable fields are union-typed.
const VALID = {
  id: "00000000-0000-0000-0000-000000000bbb",
  url: "https://example.com/landing",
  country_code: "US",
  emulator_id: "default",
  status: "completed",
  offer_url: "https://example.com/offer",
  screenshot_url:
    "https://app.kaminari.ad/api/v1/scans/00000000-0000-0000-0000-000000000bbb/screenshot",
  report_url: "https://app.kaminari.ad/scans/00000000-0000-0000-0000-000000000bbb",
  public_report_url: "https://app.kaminari.ad/public/scans/00000000-0000-0000-0000-000000000bbb",
  ad_tag: null,
  creative_screenshot_url: "",
  page_title: "Example",
  elapsed_ms: 1234,
  error: "",
  labels: { campaign: "spring" },
  campaign_id: "00000000-0000-0000-0000-000000000ccc",
  campaign_name: "Spring",
  created_at: "2026-05-17T00:00:00Z",
  completed_at: "2026-05-17T00:00:05Z",
};

describe("parseScan", () => {
  it("Ok valid", () => {
    const r = parseScan(VALID);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().country_code).toBe("US");
  });
  it("preserves the absolute report deep-links + screenshot URL", () => {
    const v = parseScan(VALID)._unsafeUnwrap();
    expect(v.report_url).toBe("https://app.kaminari.ad/scans/00000000-0000-0000-0000-000000000bbb");
    expect(v.public_report_url).toBe(
      "https://app.kaminari.ad/public/scans/00000000-0000-0000-0000-000000000bbb"
    );
    expect(v.screenshot_url).toContain("/api/v1/scans/");
  });
  it("Ok valid with null nullable fields", () => {
    const r = parseScan({
      ...VALID,
      campaign_id: null,
      campaign_name: null,
      completed_at: null,
    });
    expect(r._unsafeUnwrap().campaign_id).toBeNull();
  });
  it("rejects on missing required (id)", () => {
    const { id: _omit, ...withoutId } = VALID;
    expect(parseScan(withoutId).isErr()).toBe(true);
  });
  it("surfaces VAST fields (vast_tag, creative_kind, video)", () => {
    const r = parseScan({
      ...VALID,
      url: "",
      ad_tag: null,
      vast_tag: "https://ad.server/vast?id=1",
      creative_kind: "video",
      video: {
        duration_ms: 15000,
        mediafile_url: "https://cdn.example/ad.mp4",
        vast_version: "4.0",
        ad_system: "AdServer",
        is_vpaid: false,
        wrapper_depth: 1,
      },
    });
    const scan = r._unsafeUnwrap();
    expect(scan.vast_tag).toBe("https://ad.server/vast?id=1");
    expect(scan.creative_kind).toBe("video");
    expect(scan.video?.vast_version).toBe("4.0");
  });
  it("defaults creative_kind to banner and video to absent for non-VAST scans", () => {
    const scan = parseScan(VALID)._unsafeUnwrap();
    expect(scan.creative_kind).toBe("banner");
    expect(scan.video ?? null).toBeNull();
  });
  it("passes through a creative_kind the generated enum does not know", () => {
    // Forward-compat policy (see `ScanResponse.creative_kind`): a new API
    // value must degrade one field, not fail the whole scan parse.
    const r = parseScan({ ...VALID, creative_kind: "html" });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().creative_kind).toBe("html");
  });
  it("surfaces the creative's click_through destination", () => {
    const scan = parseScan({
      ...VALID,
      creative_kind: "video",
      video: {
        duration_ms: 15000,
        mediafile_url: "https://cdn.example/ad.mp4",
        click_through: "https://advertiser.example/offer",
        vast_version: "4.0",
        ad_system: "AdServer",
        is_vpaid: false,
        wrapper_depth: 1,
      },
    })._unsafeUnwrap();
    expect(scan.video?.click_through).toBe("https://advertiser.example/offer");
  });
  it("keeps the repeat / retry block through the pick whitelist", () => {
    const scan = parseScan({
      ...VALID,
      repeat_index: 2,
      repeat_total: 5,
      repeat_session_id: "00000000-0000-0000-0000-0000000005e5",
      repeat_scan_ids: [
        "00000000-0000-0000-0000-000000000ab1",
        "00000000-0000-0000-0000-000000000ab2",
      ],
      retry_attempt: 1,
      retry_max_attempts: 3,
    })._unsafeUnwrap();
    expect(scan.repeat_index).toBe(2);
    expect(scan.repeat_total).toBe(5);
    expect(scan.repeat_session_id).toBe("00000000-0000-0000-0000-0000000005e5");
    expect(scan.repeat_scan_ids).toEqual([
      "00000000-0000-0000-0000-000000000ab1",
      "00000000-0000-0000-0000-000000000ab2",
    ]);
    expect(scan.retry_attempt).toBe(1);
    expect(scan.retry_max_attempts).toBe(3);
  });
  it("distinguishes an empty repeat_scan_ids from an absent one", () => {
    // The API declares `list[UUID] = []`, so list and detail responses send
    // `[]` rather than omitting the key. The spec still marks it optional
    // (defaulted), and the generated schema carries no zod default, so an
    // omitted key must parse cleanly and simply not appear — never `[]`
    // invented here, never a failed parse.
    expect(parseScan({ ...VALID, repeat_scan_ids: [] })._unsafeUnwrap().repeat_scan_ids).toEqual(
      []
    );
    const absent = parseScan(VALID);
    expect(absent.isOk()).toBe(true);
    expect("repeat_scan_ids" in absent._unsafeUnwrap()).toBe(false);
  });
  it("defaults the repeat / retry block to a single un-retried scan", () => {
    const scan = parseScan(VALID)._unsafeUnwrap();
    expect(scan.repeat_index).toBe(0);
    expect(scan.repeat_total).toBe(1);
    expect(scan.repeat_session_id ?? null).toBeNull();
    expect(scan.retry_attempt).toBe(0);
    expect(scan.retry_max_attempts).toBe(0);
  });
});

describe("parseScanArray", () => {
  it("Ok valid", () => {
    expect(parseScanArray([VALID]).isOk()).toBe(true);
  });
  it("Ok empty", () => {
    expect(parseScanArray([]).isOk()).toBe(true);
  });
  it("rejects non-array", () => {
    expect(parseScanArray({}).isErr()).toBe(true);
  });
});
