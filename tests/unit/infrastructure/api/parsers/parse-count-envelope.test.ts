import { describe, expect, it } from "vitest";

import { parseIntField } from "../../../../../src/infrastructure/api/parsers/parse-count-envelope.js";

describe("parseIntField", () => {
  it("returns Ok for a valid integer field", () => {
    expect(parseIntField({ queued_count: 5 }, "queued_count")).toMatchObject({
      _unsafeUnwrap: expect.any(Function),
    });
    const r = parseIntField({ cancelled_count: 1 }, "cancelled_count");
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ cancelled_count: 1 });
  });

  it("rejects non-object input", () => {
    expect(parseIntField("string", "x").isErr()).toBe(true);
    expect(parseIntField(null, "x").isErr()).toBe(true);
    expect(parseIntField([], "x").isErr()).toBe(true);
  });

  it("rejects when the field is missing", () => {
    expect(parseIntField({}, "queued_count").isErr()).toBe(true);
  });

  it("rejects when the field is not an integer", () => {
    expect(parseIntField({ x: 1.5 }, "x").isErr()).toBe(true);
    expect(parseIntField({ x: "1" }, "x").isErr()).toBe(true);
    expect(parseIntField({ x: NaN }, "x").isErr()).toBe(true);
  });
});
