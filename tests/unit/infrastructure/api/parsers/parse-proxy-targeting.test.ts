import { describe, expect, it } from "vitest";

import { parseProxyTargeting } from "../../../../../src/infrastructure/api/parsers/parse-proxy-targeting.js";

const VALID = {
  country_code: "US",
  proxy_type: "residential",
  regions: ["florida"],
  cities: ["miami"],
  isps: ["comcast cable"],
  refreshed_at: "2026-08-20T18:00:00Z",
  ttl_seconds: 86400,
};

describe("parseProxyTargeting", () => {
  it("accepts a well-formed payload", () => {
    const result = parseProxyTargeting(VALID);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().regions).toEqual(["florida"]);
  });

  it("accepts a null refreshed_at", () => {
    // Null is the documented "we have not synced this country yet"
    // signal, which a client must be able to tell from empty arrays
    // with a timestamp.
    const result = parseProxyTargeting({ ...VALID, refreshed_at: null });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().refreshed_at).toBeNull();
  });

  it("accepts empty arrays for an unsupported country", () => {
    const result = parseProxyTargeting({
      ...VALID,
      regions: [],
      cities: [],
      isps: [],
    });
    expect(result.isOk()).toBe(true);
  });

  it("ignores unknown fields so an additive API change cannot break it", () => {
    const result = parseProxyTargeting({ ...VALID, asns: ["AS7922"] });
    expect(result.isOk()).toBe(true);
  });

  it("rejects a payload missing a required field", () => {
    const { isps: _isps, ...withoutIsps } = VALID;
    const result = parseProxyTargeting(withoutIsps);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("upstream");
  });
});
