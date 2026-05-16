/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §11.
 *
 * A unique Bearer marker NEVER appears in pino output. Only its
 * 8-char SHA-256 hash prefix does (the `bearer_hash` field).
 *
 * Covers both:
 *   - The `BearerToken` value object's self-redaction
 *     (`toString` / `toJSON` / `util.inspect` all return a placeholder).
 *   - The pino logger's `authorization` field redaction.
 */

import { describe, expect, it } from "vitest";
import { Writable } from "node:stream";

import { BearerToken } from "../../src/domain/value-objects/bearer-token.js";
import { createPinoLogger } from "../../src/infrastructure/logging/pino-logger.js";

class MemorySink extends Writable {
  readonly chunks: string[] = [];
  override _write(
    chunk: string | Buffer,
    _encoding: BufferEncoding,
    callback: (err?: Error | null) => void
  ): void {
    this.chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8"));
    callback();
  }
  override toString(): string {
    return this.chunks.join("");
  }
}

const MARKER = "kad_THIS_IS_A_UNIQUE_TOKEN_MARKER_NEVER_LOG_THIS";

describe("isolation: token never appears in logs", () => {
  it("BearerToken redacts toString / toJSON / template literal", () => {
    const t = BearerToken.fromString(MARKER)!;
    expect(String(t)).not.toContain("UNIQUE_TOKEN_MARKER");
    expect(JSON.stringify({ tok: t })).not.toContain("UNIQUE_TOKEN_MARKER");
    expect(`${t}`).not.toContain("UNIQUE_TOKEN_MARKER");
  });

  it("pino redacts `authorization` field", () => {
    const sink = new MemorySink();
    const log = createPinoLogger("debug", "json", sink);
    log.info({ authorization: `Bearer ${MARKER}` }, "trying-to-log-token");
    const out = sink.toString();
    expect(out).not.toContain("UNIQUE_TOKEN_MARKER");
    expect(out).toMatch(/REDACTED/);
  });

  it("logging a structured bag with the bearer's hash does NOT leak the token", () => {
    const sink = new MemorySink();
    const log = createPinoLogger("debug", "json", sink);
    const t = BearerToken.fromString(MARKER)!;
    const child = log.child({ bearer_hash: t.hash() });
    child.info({ tool_name: "list_scans" }, "tool.start");
    const out = sink.toString();
    expect(out).not.toContain("UNIQUE_TOKEN_MARKER");
    expect(out).toContain(t.hash());
  });

  it("BearerToken.fullHash() returns the long hash but never reveals the raw token", () => {
    const t = BearerToken.fromString(MARKER)!;
    expect(t.fullHash()).toMatch(/^[0-9a-f]{64}$/);
    expect(t.fullHash()).not.toContain("UNIQUE_TOKEN_MARKER");
  });
});
