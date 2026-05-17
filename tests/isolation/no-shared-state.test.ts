/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §1.
 *
 * Dual-gate for "no module-level mutable state": this test runs the
 * same AST scan that `scripts/check-no-shared-state.ts` runs in CI.
 * Having it in the unit/isolation suite means a regression breaks
 * local `make test` too, not just CI.
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

describe("isolation: no module-level mutable state in src/", () => {
  it("scripts/check-no-shared-state.ts passes", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const scriptPath = resolve(here, "..", "..", "scripts", "check-no-shared-state.ts");
    const result = spawnSync("npx", ["tsx", scriptPath], { encoding: "utf8" });
    if (result.status !== 0) {
      throw new Error(
        `check-no-shared-state failed:\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
      );
    }
    expect(result.status).toBe(0);
  }, 30_000);
});
