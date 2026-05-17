/**
 * Per-tenant leaky-bucket rate limiter.
 *
 * Tenant key = `bearerHash` (NOT the raw bearer). Each bucket has a
 * capacity of `rpm` tokens and refills `rpm / 60` tokens per second.
 *
 * The store is in-memory per process: it does NOT coordinate across
 * replicas. A multi-replica deployment would multiply the effective
 * limit by N. This is acceptable as a first-line defense against
 * runaway agent loops and brute-force token scans; the API has its
 * own rate limit as the authoritative gate.
 *
 * Memory: we sweep the bucket map every {@link SWEEP_EVERY_N_CHECKS}
 * `check()` calls and evict any bucket that hasn't been touched in
 * {@link SWEEP_IDLE_MS}. After that long an idle period the bucket
 * is fully refilled (refill rate is `rpm / 60_000` ms, so anything
 * past the refill window is at capacity), and dropping a full bucket
 * is equivalent to a fresh allocation on the next request — no
 * loss of rate-limit fidelity. Prevents unbounded growth from
 * one-shot bearers / rotated API keys.
 *
 * The bucket map only holds hashes — no tenant data ever leaks here.
 */

import type { Clock } from "../../domain/ports/clock.js";
import type { RateLimitDecision, RateLimiter } from "../../domain/ports/rate-limiter.js";

interface Bucket {
  /** Available tokens (fractional, refilled over time). */
  tokens: number;
  /** When tokens were last refilled (epoch ms). */
  lastRefillMs: number;
}

/**
 * How often (in `check()` calls) the limiter walks its bucket map to
 * evict full-and-idle buckets. Tuned so a single-request burst of N
 * distinct bearers cannot grow the map past ~`2 * SWEEP_EVERY_N_CHECKS`.
 */
const SWEEP_EVERY_N_CHECKS = 256;
/**
 * Bucket must be idle for at least this long since the last `check`
 * to be sweep-eligible. Equal to the refill window (60s) so the
 * bucket is guaranteed to be at full capacity when we drop it —
 * eviction has no observable effect on the next caller.
 */
const SWEEP_IDLE_MS = 60_000;

/**
 * Build a leaky-bucket rate limiter.
 *
 * @param clock - Clock for token refill calculations.
 * @param rpm   - Requests-per-minute capacity per tenant hash.
 */
export function createLeakyBucketRateLimiter(clock: Clock, rpm: number): RateLimiter {
  if (rpm < 1) throw new Error("rpm must be >= 1");
  const refillPerMs = rpm / 60_000;
  const buckets = new Map<string, Bucket>();
  let checkCount = 0;

  function refill(bucket: Bucket): void {
    const now = clock.nowMs();
    const elapsed = now - bucket.lastRefillMs;
    if (elapsed > 0) {
      bucket.tokens = Math.min(rpm, bucket.tokens + elapsed * refillPerMs);
      bucket.lastRefillMs = now;
    }
  }

  function sweepIfDue(): void {
    checkCount += 1;
    if (checkCount % SWEEP_EVERY_N_CHECKS !== 0) return;
    const now = clock.nowMs();
    for (const [hash, bucket] of buckets) {
      if (now - bucket.lastRefillMs >= SWEEP_IDLE_MS) {
        buckets.delete(hash);
      }
    }
  }

  return {
    check(tenantHash: string): RateLimitDecision {
      sweepIfDue();
      let bucket = buckets.get(tenantHash);
      if (bucket === undefined) {
        bucket = { tokens: rpm, lastRefillMs: clock.nowMs() };
        buckets.set(tenantHash, bucket);
      }
      refill(bucket);
      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        return { allowed: true };
      }
      const deficit = 1 - bucket.tokens;
      const retryAfterMs = Math.ceil(deficit / refillPerMs);
      return { allowed: false, retryAfterMs };
    },
  };
}
