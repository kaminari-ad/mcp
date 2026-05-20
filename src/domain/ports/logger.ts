/**
 * Structured logging port. The single thing `src/` is allowed to log
 * through; `console.*` is banned by ESLint.
 *
 * Field naming mirrors the Kaminari.Ad api repo (`request_id`,
 * `tool_name`, `elapsed_ms`, `bearer_hash`, ...) so cross-system grep
 * works.
 *
 * Bearer tokens MUST NOT appear in any log line. The
 * {@link BearerToken} value object self-redacts; if you log structured
 * data, double-check the redaction config of the concrete adapter.
 */

/**
 * Bag of fields attached to a log line. Allowed value types are kept
 * narrow so the pino adapter's redaction can guarantee no nested
 * surprises.
 */
export type LogFields = Readonly<Record<string, string | number | boolean | undefined>>;

export interface Logger {
  /**
   * Returns a logger that includes `fields` on every subsequent line.
   * Used to scope a logger to a request (`request_id`, `bearer_hash`)
   * once at the transport edge.
   */
  child(fields: LogFields): Logger;

  trace(fields: LogFields, message: string): void;
  debug(fields: LogFields, message: string): void;
  info(fields: LogFields, message: string): void;
  warn(fields: LogFields, message: string): void;
  error(fields: LogFields, message: string): void;
  fatal(fields: LogFields, message: string): void;
}
