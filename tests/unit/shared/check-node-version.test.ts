/**
 * Pure-function tests for the Node-version preflight that runs at the
 * top of `bin.ts::main()`. Lock down the boundary cases (the v0.2.1
 * floor is `>=22.19.0` because undici@8.x requires markAsUncloneable
 * from node:worker_threads, available only on Node 22.19+).
 *
 * If the floor changes (e.g. undici 9.x bumps it), bump
 * `REQUIRED_NODE_MAJOR`/`REQUIRED_NODE_MINOR` and update both the
 * boundary cases here AND `engines.node` in `package.json`.
 */

import { describe, expect, it } from "vitest";

import {
  checkNodeVersion,
  REQUIRED_NODE_MAJOR,
  REQUIRED_NODE_MINOR,
} from "../../../src/shared/check-node-version.js";

describe("checkNodeVersion (v0.2.1 floor: >=22.19.0)", () => {
  // ── Pass cases ────────────────────────────────────────────────

  it("accepts the exact required version", () => {
    expect(checkNodeVersion("22.19.0").isOk()).toBe(true);
  });

  it("accepts a newer patch on the required minor", () => {
    expect(checkNodeVersion("22.19.5").isOk()).toBe(true);
  });

  it("accepts a newer minor on the required major", () => {
    expect(checkNodeVersion("22.20.0").isOk()).toBe(true);
  });

  it("accepts a newer major (any minor/patch)", () => {
    expect(checkNodeVersion("23.0.0").isOk()).toBe(true);
    expect(checkNodeVersion("24.5.1").isOk()).toBe(true);
    expect(checkNodeVersion("25.9.0").isOk()).toBe(true);
  });

  it("accepts a prerelease semver tag on a passing version (split on `.` first)", () => {
    // `22.19.0-rc.1` → split('.')[0..1] = ['22', '19'] → passes.
    expect(checkNodeVersion("22.19.0-rc.1").isOk()).toBe(true);
  });

  // ── Fail cases ────────────────────────────────────────────────

  it("rejects a lower minor on the required major (Node 22.18.x)", () => {
    const r = checkNodeVersion("22.18.99");
    expect(r.isErr()).toBe(true);
    if (r.isErr()) {
      expect(r.error).toContain("requires Node.js >=22.19.0");
      expect(r.error).toContain("v22.18.99");
      expect(r.error).toContain("markAsUncloneable");
    }
  });

  it("rejects Node 22.13 (the previous v0.2.0 declared floor)", () => {
    expect(checkNodeVersion("22.13.0").isErr()).toBe(true);
  });

  it("rejects an older major (Node 21.x)", () => {
    expect(checkNodeVersion("21.7.3").isErr()).toBe(true);
  });

  it("rejects Node 20.x (Cursor / Claude Desktop in the wild)", () => {
    const r = checkNodeVersion("20.18.0");
    expect(r.isErr()).toBe(true);
    if (r.isErr()) {
      expect(r.error).toContain("v20.18.0");
      expect(r.error).toContain("https://nodejs.org/en/download");
    }
  });

  it("fail-closed on garbage / partial version strings", () => {
    expect(checkNodeVersion("abc").isErr()).toBe(true);
    expect(checkNodeVersion("22").isErr()).toBe(true);
    expect(checkNodeVersion("").isErr()).toBe(true);
  });

  // ── Constants ────────────────────────────────────────────────

  it("exposes the required-version constants for keep-in-sync", () => {
    expect(REQUIRED_NODE_MAJOR).toBe(22);
    expect(REQUIRED_NODE_MINOR).toBe(19);
  });
});
