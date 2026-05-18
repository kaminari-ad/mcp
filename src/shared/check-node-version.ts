/**
 * Pure Node-version preflight, extracted from {@link bin.ts} so it
 * can be unit-tested without `process.exit` side effects.
 *
 * Why this exists: `undici@8.x` removed feature probes in v8.0.3 and
 * imports `markAsUncloneable` from `node:worker_threads`
 * unconditionally — that symbol only exists on Node 22.19+. Older
 * Node versions crash at import time with the cryptic message
 * `webidl.util.markAsUncloneable is not a function`. We surface a
 * clean upgrade message instead, BEFORE any dynamic import pulls
 * undici.
 *
 * Keep {@link REQUIRED_NODE_MAJOR} / {@link REQUIRED_NODE_MINOR} in
 * sync with `engines.node` in `package.json` (currently
 * `>=22.19.0`).
 */

import { err, ok, type Result } from "./result.js";
import { NAME } from "./version.js";

export const REQUIRED_NODE_MAJOR = 22;
export const REQUIRED_NODE_MINOR = 19;

/**
 * Check whether `nodeVersion` (e.g. `"22.19.0"`, the value of
 * `process.versions.node`) satisfies the package's runtime floor.
 *
 * Returns `Ok(undefined)` on pass, `Err(message)` with a multi-line
 * upgrade message on fail. The message is plain text ready to be
 * written to stderr verbatim.
 */
export function checkNodeVersion(nodeVersion: string): Result<undefined, string> {
  const parts = nodeVersion.split(".");
  const major = Number(parts[0]);
  const minor = Number(parts[1]);
  if (
    Number.isNaN(major) ||
    Number.isNaN(minor) ||
    major < REQUIRED_NODE_MAJOR ||
    (major === REQUIRED_NODE_MAJOR && minor < REQUIRED_NODE_MINOR)
  ) {
    const required = `>=${String(REQUIRED_NODE_MAJOR)}.${String(REQUIRED_NODE_MINOR)}.0`;
    return err(
      [
        `${NAME} requires Node.js ${required} (you have v${nodeVersion}).`,
        "",
        "The underlying undici 8.x HTTP client uses markAsUncloneable",
        "from node:worker_threads, available only on Node 22.19+.",
        "Older Node crashes at import time with the cryptic message",
        "`webidl.util.markAsUncloneable is not a function`.",
        "",
        "Please upgrade Node and re-run: https://nodejs.org/en/download",
      ].join("\n")
    );
  }
  return ok(undefined);
}
