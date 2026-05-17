import { describe, expect, it } from "vitest";

import { createSystemClock } from "../../../../src/infrastructure/clock/system-clock.js";

describe("SystemClock", () => {
  it("nowMs returns a positive number close to Date.now()", () => {
    const clock = createSystemClock();
    const before = Date.now();
    const t = clock.nowMs();
    const after = Date.now();
    expect(t).toBeGreaterThanOrEqual(before);
    expect(t).toBeLessThanOrEqual(after);
  });
});
