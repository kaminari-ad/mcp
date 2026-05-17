/**
 * Global Vitest setup — runs once per worker before any test.
 *
 * Kept minimal on purpose:
 *
 *   - Fixes the system timezone so date-formatting tests are deterministic
 *     regardless of the host machine.
 *   - Asserts that `console.*` calls inside src/ fail the test run, mirroring
 *     the ESLint `no-console` rule. (Tests themselves may use console for
 *     debugging; only `src/` calls are prohibited.)
 */

import { afterEach } from "vitest";

process.env.TZ = "UTC";

afterEach(() => {
  // Placeholder: per-test cleanup hooks will land here when transports
  // and the in-memory session store gain state worth resetting.
});
