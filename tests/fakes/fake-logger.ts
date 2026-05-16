/**
 * Recording-spy fake for the `Logger` port. Captures every call so
 * tests can assert on the structured fields, especially in
 * tenant-isolation tests where we assert that secrets never appear.
 */

import type { LogFields, Logger } from "../../src/domain/ports/logger.js";

export type LogLevelName = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogRecord {
  readonly level: LogLevelName;
  readonly fields: Readonly<LogFields>;
  readonly message: string;
}

export interface FakeLoggerState {
  readonly records: LogRecord[];
}

export function createFakeLogger(parentFields: LogFields = {}): Logger & {
  readonly state: FakeLoggerState;
} {
  const state: FakeLoggerState = { records: [] };

  function record(level: LogLevelName, fields: LogFields, message: string): void {
    state.records.push({
      level,
      fields: { ...parentFields, ...fields },
      message,
    });
  }

  return {
    state,
    child(extra) {
      return createFakeLogger({ ...parentFields, ...extra });
    },
    trace: (f, m) => {
      record("trace", f, m);
    },
    debug: (f, m) => {
      record("debug", f, m);
    },
    info: (f, m) => {
      record("info", f, m);
    },
    warn: (f, m) => {
      record("warn", f, m);
    },
    error: (f, m) => {
      record("error", f, m);
    },
    fatal: (f, m) => {
      record("fatal", f, m);
    },
  };
}
