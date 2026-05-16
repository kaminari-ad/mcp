/**
 * Deterministic `Clock` for tests. Starts at the provided epoch ms;
 * `advance(ms)` moves it forward.
 */

import type { Clock } from "../../src/domain/ports/clock.js";

export interface FakeClock extends Clock {
  advance(deltaMs: number): void;
  set(epochMs: number): void;
}

export function createFakeClock(startMs = 1_700_000_000_000): FakeClock {
  let current = startMs;
  return {
    nowMs: () => current,
    advance: (delta) => {
      current += delta;
    },
    set: (epochMs) => {
      current = epochMs;
    },
  };
}
