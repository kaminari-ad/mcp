/**
 * Error-reporting port. The OSS default adapter is a no-op
 * ({@link NoopErrorReporter}) — operators may swap in their own (e.g.
 * Sentry) at deployment time, but that lives outside this OSS bundle.
 *
 * Why a port: tests inject a recording fake and assert that adapters
 * report at the right places. Domain/application code never imports
 * `sentry`, `pino-sentry`, etc. directly.
 */

export interface ErrorReporter {
  /**
   * Report an unexpected error. `extra` is a small bag of string
   * context (request_id, tool_name, bearer_hash, ...). The reporter
   * MUST redact any obviously sensitive fields before forwarding.
   */
  capture(error: unknown, extra?: Readonly<Record<string, string>>): void;
}
