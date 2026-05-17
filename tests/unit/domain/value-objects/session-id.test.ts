import { describe, expect, it } from "vitest";

import { newSessionId, parseSessionId } from "../../../../src/domain/value-objects/session-id.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("SessionId", () => {
  it("newSessionId returns a UUID", () => {
    expect(newSessionId()).toMatch(UUID);
  });

  it("parseSessionId round-trips", () => {
    const id = newSessionId();
    expect(parseSessionId(id)).toBe(id);
  });

  it("parseSessionId rejects malformed input", () => {
    expect(parseSessionId("not-a-uuid")).toBeUndefined();
  });
});
