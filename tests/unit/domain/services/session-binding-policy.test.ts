import { describe, expect, it } from "vitest";

import { decideSessionAction } from "../../../../src/domain/services/session-binding-policy.js";

describe("decideSessionAction", () => {
  it("allows when the store says ok", () => {
    expect(decideSessionAction({ kind: "ok" })).toEqual({ kind: "allow" });
  });

  it("flags unknown session-id", () => {
    expect(decideSessionAction({ kind: "unknown" })).toEqual({ kind: "unknown-session" });
  });

  it("rejects bearer mismatch", () => {
    expect(decideSessionAction({ kind: "bound-to-other-bearer" })).toEqual({
      kind: "reject-bearer-mismatch",
    });
  });
});
