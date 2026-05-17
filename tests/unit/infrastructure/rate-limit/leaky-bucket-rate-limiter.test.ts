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

  it("sweeps idle buckets after SWEEP_EVERY_N_CHECKS calls", () => {
    // SWEEP_EVERY_N_CHECKS = 256, SWEEP_IDLE_MS = 60_000.
    // Strategy: touch an early bucket once, then leave it idle for
    // longer than the refill window; finally hit 256 other bearers to
    // trigger the sweep. The early bucket should be evicted; the
    // proof is indirect — refilling state would have remembered the
    // earlier consumption, but a fresh allocation gives back a full
    // bucket.
    const clock = createFakeClock();
    const rl = createLeakyBucketRateLimiter(clock, 2);
    rl.check("early"); // tokens: 1, lastRefillMs: 0
    // Advance past SWEEP_IDLE_MS so the early bucket is sweep-eligible.
    clock.advance(120_000);
    // 256 checks on different bearers trigger one sweep call.
    for (let i = 0; i < 256; i += 1) rl.check(`other-${String(i)}`);
    // If sweep ran, "early" is gone — next check allocates a fresh
    // 2-token bucket and we can pull both tokens. (If sweep hadn't
    // run, the refill since t=0 would have already capped tokens at 2
    // anyway, so this isn't a strong assertion about state — it's a
    // smoke test that the sweep path executes without error.)
    expect(rl.check("early").allowed).toBe(true);
    expect(rl.check("early").allowed).toBe(true);
    expect(rl.check("early").allowed).toBe(false);
  });
});
