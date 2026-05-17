/**
 * Production {@link Clock} adapter. Reads the system clock via
 * `Date.now()`. Tests use `FakeClock` instead.
 */

import type { Clock } from "../../domain/ports/clock.js";

/**
 * Returns a fresh `Clock` backed by `Date.now()`.
 */
export function createSystemClock(): Clock {
  return {
    nowMs(): number {
      return Date.now();
    },
  };
}
