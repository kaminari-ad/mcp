import { describe, expect, it } from "vitest";

import { parseGeoList } from "../../../../../src/infrastructure/api/parsers/parse-geo-list.js";

describe("parseGeoList", () => {
  it("returns Ok for an array of valid geos", () => {
    const result = parseGeoList([
      { country_code: "US", name: "United States", region: "Americas", tier: "tier-1" },
    ]);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()[0]?.country_code).toBe("US");
  });
  it("returns Ok for an empty array", () => {
    const result = parseGeoList([]);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual([]);
  });
  it("rejects non-array input", () => {
    expect(parseGeoList({ not: "array" }).isErr()).toBe(true);
    expect(parseGeoList("string").isErr()).toBe(true);
  });
  it("rejects items that are not objects", () => {
    expect(parseGeoList(["string"]).isErr()).toBe(true);
  });
  it("rejects items missing country_code", () => {
    expect(parseGeoList([{ name: "Anonymous" }]).isErr()).toBe(true);
  });
  it("rejects items with non-string fields (strict schema)", () => {
    expect(parseGeoList([{ country_code: "US", name: 1, region: 2, tier: 3 }]).isErr()).toBe(true);
  });
});
