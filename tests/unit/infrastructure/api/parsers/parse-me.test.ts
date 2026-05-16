import { describe, expect, it } from "vitest";

import { parseMe } from "../../../../../src/infrastructure/api/parsers/parse-me.js";

describe("parseMe", () => {
  it("returns Ok for a valid response", () => {
    const result = parseMe({
      user_id: "u",
      organization_id: "o",
      email: "a@b",
      display_name: "A",
      permissions: ["x", "y"],
    });
    expect(result.isOk()).toBe(true);
  });

  it("rejects non-object input", () => {
    expect(parseMe("not an object").isErr()).toBe(true);
    expect(parseMe(null).isErr()).toBe(true);
    expect(parseMe(undefined).isErr()).toBe(true);
    expect(parseMe([1, 2, 3]).isErr()).toBe(true);
  });

  it("rejects when a string field has wrong type", () => {
    expect(
      parseMe({
        user_id: 1,
        organization_id: "o",
        email: "a@b",
        display_name: "A",
        permissions: [],
      }).isErr()
    ).toBe(true);
  });

  it("rejects when permissions is not a string array", () => {
    expect(
      parseMe({
        user_id: "u",
        organization_id: "o",
        email: "a@b",
        display_name: "A",
        permissions: [1, 2],
      }).isErr()
    ).toBe(true);
  });
});
