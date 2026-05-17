import { inspect } from "node:util";

import { describe, expect, it } from "vitest";

import { BearerToken } from "../../../../src/domain/value-objects/bearer-token.js";

describe("BearerToken", () => {
  it("constructs from a non-empty string", () => {
    const t = BearerToken.fromString("kad_abc123");
    expect(t).toBeDefined();
  });

  it("rejects empty / whitespace strings", () => {
    expect(BearerToken.fromString("")).toBeUndefined();
    expect(BearerToken.fromString("   ")).toBeUndefined();
  });

  it("parses from a well-formed Bearer header", () => {
    expect(BearerToken.fromAuthorizationHeader("Bearer kad_xyz")).toBeDefined();
    expect(BearerToken.fromAuthorizationHeader("bearer  kad_xyz")).toBeDefined();
  });

  it("rejects malformed Bearer headers", () => {
    expect(BearerToken.fromAuthorizationHeader(undefined)).toBeUndefined();
    expect(BearerToken.fromAuthorizationHeader("Basic abc")).toBeUndefined();
    expect(BearerToken.fromAuthorizationHeader("Bearer ")).toBeUndefined();
  });

  it("hash() returns 8 hex chars and is stable", () => {
    const t = BearerToken.fromString("kad_marker")!;
    expect(t.hash()).toMatch(/^[0-9a-f]{8}$/);
    expect(t.hash()).toBe(t.hash());
  });

  it("fullHash() returns 64 hex chars", () => {
    const t = BearerToken.fromString("kad_marker")!;
    expect(t.fullHash()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("toAuthorizationHeader returns the literal header value", () => {
    const t = BearerToken.fromString("kad_xyz")!;
    expect(t.toAuthorizationHeader()).toBe("Bearer kad_xyz");
  });

  it("never leaks the raw token via toString / toJSON / util.inspect", () => {
    const secret = "kad_THIS_IS_THE_SECRET_VALUE";
    const t = BearerToken.fromString(secret)!;
    expect(String(t)).not.toContain(secret);
    expect(JSON.stringify({ token: t })).not.toContain(secret);
    expect(inspect(t)).not.toContain(secret);
    expect(`${t}`).not.toContain(secret);
  });

  it("rejects an Authorization header larger than the cap (DoS guard)", () => {
    // The cap is 4096 bytes. A 5 KiB header is rejected before the
    // regex even runs.
    const tooLong = "Bearer " + "a".repeat(5000);
    expect(BearerToken.fromAuthorizationHeader(tooLong)).toBeUndefined();
  });

  it("preserves the raw token byte-for-byte regardless of inbound `Bearer` casing", () => {
    // Per RFC 6750 the scheme word is case-insensitive; the secret
    // itself is preserved exactly and the outbound header is
    // re-emitted with the canonical capitalization.
    const canonical = BearerToken.fromAuthorizationHeader("Bearer kad_xyz")!;
    const lower = BearerToken.fromAuthorizationHeader("bearer kad_xyz")!;
    const mixed = BearerToken.fromAuthorizationHeader("BeArEr kad_xyz")!;
    expect(canonical.toAuthorizationHeader()).toBe("Bearer kad_xyz");
    expect(lower.toAuthorizationHeader()).toBe("Bearer kad_xyz");
    expect(mixed.toAuthorizationHeader()).toBe("Bearer kad_xyz");
    // Same secret -> same hash.
    expect(canonical.fullHash()).toBe(lower.fullHash());
    expect(canonical.fullHash()).toBe(mixed.fullHash());
  });
});
