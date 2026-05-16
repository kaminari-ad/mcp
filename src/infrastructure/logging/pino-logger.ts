/**
 * Production {@link Logger} adapter, backed by pino.
 *
 * Tenant-isolation contract (CONTRIBUTING.md §11):
 *
 *   - Bearers never appear in logs. pino's redact paths cover the
 *     known fields (`Authorization`, `bearer`, `headers.authorization`).
 *   - Stdio mode writes to stderr (so stdout stays a pure MCP JSON-RPC
 *     channel). HTTP mode also writes to stderr; the container's
 *     stdout is reserved for crash dumps.
 */

import { pino, type Logger as PinoLoggerImpl, type LoggerOptions, stdTimeFunctions } from "pino";

import type { LogFields, Logger } from "../../domain/ports/logger.js";
import type { LogLevel } from "../../shared/config.js";

const REDACTION_PATHS: readonly string[] = [
  "authorization",
  "Authorization",
  "bearer",
  "Bearer",
  '*.authorization',
  '*.Authorization',
  'headers.authorization',
  'headers.Authorization',
  'req.headers.authorization',
  'req.headers.Authorization',
];

/**
 * Build a `Logger` backed by pino.
 *
 * @param level - Minimum level to emit; below this, calls are dropped.
 * @param format - `json` for production / Docker logs, `pretty` for
 *                 local stdio development.
 * @param destination - Where the log lines go. Defaults to process
 *                      stderr; tests supply an in-memory sink.
 */
export function createPinoLogger(
  level: LogLevel,
  format: "json" | "pretty" = "json",
  destination?: NodeJS.WritableStream
): Logger {
  const options: LoggerOptions = {
    level,
    redact: { paths: [...REDACTION_PATHS], censor: "[REDACTED]" },
    base: null,
    timestamp: stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    ...(format === "pretty"
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, ignore: "pid,hostname" },
          },
        }
      : {}),
  };
  const sink = destination ?? pino.destination(process.stderr.fd);
  return wrap(pino(options, sink));
}

function wrap(impl: PinoLoggerImpl): Logger {
  return {
    child(fields: LogFields): Logger {
      return wrap(impl.child({ ...fields }));
    },
    trace(fields, message): void {
      impl.trace({ ...fields }, message);
    },
    debug(fields, message): void {
      impl.debug({ ...fields }, message);
    },
    info(fields, message): void {
      impl.info({ ...fields }, message);
    },
    warn(fields, message): void {
      impl.warn({ ...fields }, message);
    },
    error(fields, message): void {
      impl.error({ ...fields }, message);
    },
    fatal(fields, message): void {
      impl.fatal({ ...fields }, message);
    },
  };
}
