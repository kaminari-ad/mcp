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
