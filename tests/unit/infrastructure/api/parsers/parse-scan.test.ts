import { describe, expect, it } from "vitest";

import {
  parseScan,
  parseScanArray,
} from "../../../../../src/infrastructure/api/parsers/parse-scan.js";

const VALID = {
  id: "00000000-0000-0000-0000-000000000aaa",
  url: "https://x.com",
  country_code: "US",
  emulator_id: "default",
  status: "completed",
  offer_url: "https://o.com",
  screenshot_url: "",
  ad_tag: null,
  creative_screenshot_url: "",
  page_title: "T",
  elapsed_ms: 100,
  error: "",
  labels: { k: "v" },
  campaign_id: null,
  campaign_name: null,
  created_at: "2026-01-01T00:00:00Z",
  completed_at: "2026-01-01T00:00:01Z",
};

describe("parseScan", () => {
  it("Ok for a valid scan", () => {
    expect(parseScan(VALID).isOk()).toBe(true);
  });
  it("rejects non-object input", () => {
    expect(parseScan("string").isErr()).toBe(true);
    expect(parseScan(null).isErr()).toBe(true);
  });
  it("rejects when id is missing or non-string", () => {
    expect(parseScan({ ...VALID, id: 42 }).isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID;
    expect(parseScan(withoutId).isErr()).toBe(true);
  });
  it("substitutes safe defaults for non-string string fields", () => {
    const result = parseScan({ ...VALID, url: 42, page_title: 99 });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().url).toBe("");
    expect(result._unsafeUnwrap().page_title).toBe("");
  });
  it("substitutes safe defaults for non-number elapsed_ms", () => {
    const result = parseScan({ ...VALID, elapsed_ms: "x" });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().elapsed_ms).toBe(0);
  });
  it("preserves null campaign_id and completed_at, coerces non-string to null", () => {
    const result = parseScan({ ...VALID, campaign_id: 5, completed_at: undefined });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().campaign_id).toBeNull();
    expect(result._unsafeUnwrap().completed_at).toBeNull();
  });
  it("filters non-string label values", () => {
    const result = parseScan({ ...VALID, labels: { keep: "yes", drop: 42 } });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().labels).toEqual({ keep: "yes" });
  });
  it("treats non-object labels as empty map", () => {
    const result = parseScan({ ...VALID, labels: "not an object" });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().labels).toEqual({});
  });
});

describe("parseScanArray", () => {
  it("Ok for an array of scans", () => {
    const result = parseScanArray([
      VALID,
      { ...VALID, id: "00000000-0000-0000-0000-000000000bbb" },
    ]);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toHaveLength(2);
  });
  it("Err for non-array", () => {
    expect(parseScanArray({}).isErr()).toBe(true);
  });
  it("Err for an array with a malformed item", () => {
    expect(parseScanArray([VALID, "bad"]).isErr()).toBe(true);
  });
});
