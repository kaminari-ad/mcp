import { describe, expect, it } from "vitest";

import { parseGeoList } from "../../../../../src/infrastructure/api/parsers/parse-geo-list.js";

describe("parseGeoList", () => {
  it("returns Ok for an array of valid geos", () => {
    const result = parseGeoList([
      { code: "US", name: "United States", continent: "NA", emoji: "🇺🇸" },
    ]);
    expect(result.isOk()).toBe(true);
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

  it("rejects items with wrong field types", () => {
    expect(parseGeoList([{ code: 1, name: 2, continent: 3, emoji: 4 }]).isErr()).toBe(true);
  });
});
