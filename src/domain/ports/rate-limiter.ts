/**
 * Per-tenant rate limiter for the HTTP transport.
 *
 * Keyed by `BearerToken.fullHash()` (NOT the raw token) so the bucket
 * map holds only hashes, never user secrets. The hash is collision-free
 * for our purposes: each tenant gets a unique bucket.
 *
 * Semantics intentionally minimal: each call to {@link check} either
 * consumes a slot and returns `{ allowed: true }`, or denies and
 * returns `{ allowed: false, retryAfterMs }`. Stateful storage of the
 * buckets belongs in the adapter.
 *
 * The API itself has rate limits; this is a first-line defence against
 * runaway agent loops and token brute-force, not a replacement.
 */

export interface RateLimitDecision {
  readonly allowed: boolean;
  /**
   * Hint to the caller (and to the client via `Retry-After`) for how
   * long to wait before the next attempt. Always set when `allowed` is
   * `false`; may be omitted when `allowed` is `true`.
   */
  readonly retryAfterMs?: number;
}

export interface RateLimiter {
  /**
   * Attempt to consume one slot for the given tenant hash. Pure
   * decision — no logging, no side effects other than internal bucket
   * accounting.
   */
  check(tenantHash: string): RateLimitDecision;
}
