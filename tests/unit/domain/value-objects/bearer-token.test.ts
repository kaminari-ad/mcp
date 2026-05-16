import { describe, expect, it } from "vitest";
import { inspect } from "node:util";

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
});
