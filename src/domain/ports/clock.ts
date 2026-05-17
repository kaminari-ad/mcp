/**
 * Time source. Injected so tests can use a `FakeClock` with explicit
 * `advance(ms)` rather than relying on the wall clock.
 */

export interface Clock {
  /**
   * Current time as milliseconds since the Unix epoch. Equivalent to
   * `Date.now()` for the system implementation.
   */
  nowMs(): number;
}
