import { describe, expect, it } from "vitest";

import { parseScanPage } from "../../../../../src/infrastructure/api/parsers/parse-scan-page.js";

describe("parseScanPage", () => {
  it("returns Ok for a valid envelope", () => {
    const result = parseScanPage({
      items: [
        {
          id: "x",
          url: "u",
          country_code: "US",
          status: "done",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    });
    expect(result.isOk()).toBe(true);
  });

  it("rejects non-object input", () => {
    expect(parseScanPage("string").isErr()).toBe(true);
    expect(parseScanPage(null).isErr()).toBe(true);
  });

  it("rejects when envelope fields are wrong types", () => {
    expect(parseScanPage({ items: "x", total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
    expect(parseScanPage({ items: [], total: "x", page: 1, limit: 50 }).isErr()).toBe(true);
  });

  it("rejects when an item is not an object", () => {
    expect(
      parseScanPage({
        items: ["not-an-object"],
        total: 1,
        page: 1,
        limit: 50,
      }).isErr()
    ).toBe(true);
  });

  it("rejects when an item has wrong field types", () => {
    expect(
      parseScanPage({
        items: [{ id: 1, url: "u", country_code: "US", status: "done", created_at: "x" }],
        total: 1,
        page: 1,
        limit: 50,
      }).isErr()
    ).toBe(true);
  });
});
