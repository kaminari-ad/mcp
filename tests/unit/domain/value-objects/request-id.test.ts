import { describe, expect, it } from "vitest";

import { newRequestId, parseRequestId } from "../../../../src/domain/value-objects/request-id.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("RequestId", () => {
  it("newRequestId returns a UUID", () => {
    expect(newRequestId()).toMatch(UUID);
  });

  it("parseRequestId round-trips a v4 UUID", () => {
    const id = newRequestId();
    expect(parseRequestId(id)).toBe(id);
  });

  it("parseRequestId rejects malformed input", () => {
    expect(parseRequestId("not-a-uuid")).toBeUndefined();
    expect(parseRequestId("")).toBeUndefined();
  });
});
