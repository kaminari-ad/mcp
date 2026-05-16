import { describe, expect, it } from "vitest";
import { Writable } from "node:stream";

import { createPinoLogger } from "../../../../src/infrastructure/logging/pino-logger.js";

/**
 * In-memory sink that pino writes to. Tests inspect `.toString()`.
 */
class MemorySink extends Writable {
  readonly chunks: string[] = [];
  override _write(
    chunk: string | Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.chunks.push(typeof chunk === "string" ? chunk : chunk.toString("utf8"));
    callback();
  }
  override toString(): string {
    return this.chunks.join("");
  }
}

describe("PinoLogger", () => {
  it("emits a JSON line with the message and fields", () => {
    const sink = new MemorySink();
    const log = createPinoLogger("info", "json", sink);
    log.info({ tool_name: "list_scans", elapsed_ms: 12 }, "tool.done");
    const out = sink.toString();
    expect(out).toMatch(/tool\.done/);
    expect(out).toMatch(/list_scans/);
    expect(out).toMatch(/"elapsed_ms":12/);
  });

  it("redacts the Authorization field", () => {
    const sink = new MemorySink();
    const log = createPinoLogger("info", "json", sink);
    log.info({ authorization: "Bearer SECRET_MARKER" }, "test");
    const out = sink.toString();
    expect(out).not.toContain("SECRET_MARKER");
    expect(out).toMatch(/REDACTED/);
  });

  it("child() inherits fields from parent", () => {
    const sink = new MemorySink();
    const log = createPinoLogger("info", "json", sink);
    const scoped = log.child({ request_id: "REQ-MARKER" });
    scoped.info({ tool_name: "x" }, "msg");
    expect(sink.toString()).toContain("REQ-MARKER");
  });

  it("suppresses log lines below the configured level", () => {
    const sink = new MemorySink();
    const log = createPinoLogger("warn", "json", sink);
    log.debug({}, "this should not appear");
    log.warn({}, "warned-MARKER");
    const out = sink.toString();
    expect(out).not.toContain("this should not appear");
    expect(out).toContain("warned-MARKER");
  });

  it("pretty format constructs without throwing (stdio dev mode)", () => {
    const sink = new MemorySink();
    const log = createPinoLogger("info", "pretty", sink);
    expect(() => log.info({}, "ok")).not.toThrow();
  });

  it("trace / debug / error / fatal go through wrap()", () => {
    const sink = new MemorySink();
    const log = createPinoLogger("trace", "json", sink);
    log.trace({}, "t-line");
    log.debug({}, "d-line");
    log.error({}, "e-line");
    log.fatal({}, "f-line");
    const out = sink.toString();
    expect(out).toMatch(/t-line/);
    expect(out).toMatch(/d-line/);
    expect(out).toMatch(/e-line/);
    expect(out).toMatch(/f-line/);
  });
});
