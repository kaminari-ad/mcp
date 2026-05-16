import { describe, expect, it } from "vitest";

import { createLeakyBucketRateLimiter } from "../../../../src/infrastructure/rate-limit/leaky-bucket-rate-limiter.js";
import { createFakeClock } from "../../../fakes/fake-clock.js";

describe("LeakyBucketRateLimiter", () => {
  it("allows the first N requests up to bucket capacity", () => {
    const rl = createLeakyBucketRateLimiter(createFakeClock(), 5);
    for (let i = 0; i < 5; i += 1) {
      expect(rl.check("h1").allowed).toBe(true);
    }
  });

  it("denies the (N+1)th request and returns retryAfterMs", () => {
    const rl = createLeakyBucketRateLimiter(createFakeClock(), 3);
    rl.check("h1");
    rl.check("h1");
    rl.check("h1");
    const decision = rl.check("h1");
    expect(decision.allowed).toBe(false);
    expect(decision.retryAfterMs).toBeGreaterThan(0);
  });

  it("buckets are per-tenant — different hashes have independent limits", () => {
    const rl = createLeakyBucketRateLimiter(createFakeClock(), 1);
    expect(rl.check("h1").allowed).toBe(true);
    expect(rl.check("h2").allowed).toBe(true);
    expect(rl.check("h1").allowed).toBe(false);
  });

  it("tokens refill over time", () => {
    const clock = createFakeClock();
    const rl = createLeakyBucketRateLimiter(clock, 60); // 1 token / sec
    for (let i = 0; i < 60; i += 1) {
      rl.check("h1");
    }
    expect(rl.check("h1").allowed).toBe(false);
    clock.advance(1_000);
    expect(rl.check("h1").allowed).toBe(true);
  });

  it("rejects rpm < 1", () => {
    expect(() => createLeakyBucketRateLimiter(createFakeClock(), 0)).toThrow();
  });

  it("caps tokens at the configured rpm even after long idle", () => {
    const clock = createFakeClock();
    const rl = createLeakyBucketRateLimiter(clock, 5);
    // Drain.
    for (let i = 0; i < 5; i += 1) rl.check("h1");
    // Long idle — bucket should refill to AT MOST 5 tokens, not 5+more.
    clock.advance(1_000_000);
    for (let i = 0; i < 5; i += 1) expect(rl.check("h1").allowed).toBe(true);
    expect(rl.check("h1").allowed).toBe(false);
  });
});
