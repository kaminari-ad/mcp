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
 * The bucket map only holds hashes — no tenant data ever leaks here.
 */

import type { Clock } from "../../domain/ports/clock.js";
import type {
  RateLimitDecision,
  RateLimiter,
} from "../../domain/ports/rate-limiter.js";

interface Bucket {
  /** Available tokens (fractional, refilled over time). */
  tokens: number;
  /** When tokens were last refilled (epoch ms). */
  lastRefillMs: number;
}

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

  function refill(bucket: Bucket): void {
    const now = clock.nowMs();
    const elapsed = now - bucket.lastRefillMs;
    if (elapsed > 0) {
      bucket.tokens = Math.min(rpm, bucket.tokens + elapsed * refillPerMs);
      bucket.lastRefillMs = now;
    }
  }

  return {
    check(tenantHash: string): RateLimitDecision {
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
