/**
 * Runtime configuration for `@kaminari-ad/mcp`.
 *
 * The single source of truth for all env-var reads. `process.env.X`
 * outside this file is a code-review blocker — every config value flows
 * through the zod-parsed {@link Config} object.
 */

import { z } from "zod";

import { err, ok, type Result } from "./result.js";

/**
 * MCP transport. `stdio` is for local install (one process per user);
 * `http` is for the hosted multi-tenant endpoint.
 */
export const TransportSchema = z.enum(["stdio", "http"]);
export type Transport = z.infer<typeof TransportSchema>;

/**
 * pino log level.
 */
export const LogLevelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal"]);
export type LogLevel = z.infer<typeof LogLevelSchema>;

/**
 * pino log output format.
 *
 * - `pretty` — colorised single-line ANSI output for terminals. Default
 *   in stdio mode (operator reads stderr in their shell).
 * - `json` — newline-delimited JSON, one record per line. Default in
 *   HTTP mode (Docker/k8s log aggregators expect JSON). MCP hosts that
 *   capture stderr from the stdio process (Cursor, Claude Desktop)
 *   parse much better with `json` — flip this when the operator is a
 *   machine, not a human.
 */
export const LogFormatSchema = z.enum(["pretty", "json"]);
export type LogFormat = z.infer<typeof LogFormatSchema>;

/**
 * Parsed configuration. All fields are `readonly` — mutation post-load
 * is a bug.
 */
export interface Config {
  readonly transport: Transport;
  readonly apiBaseUrl: string;
  readonly logLevel: LogLevel;
  readonly logFormat: LogFormat;
  readonly httpPort: number;
  readonly sessionTtlSec: number;
  readonly rateLimitRpm: number;
  /**
   * Set only in stdio mode. In HTTP mode the bootstrap MUST assert
   * this is `undefined` (see CONTRIBUTING.md "Tenant isolation" §5).
   */
  readonly stdioApiKey: string | undefined;
}

/**
 * Every env var carries the `KAMINARI_AD_` namespace prefix.
 *
 * Why: this process inherits the host's full environment (Cursor /
 * Claude Desktop / Docker compose / k8s pod), where `API_BASE_URL` /
 * `LOG_LEVEL` / `HTTP_PORT` are common generic names. Without a
 * namespace, another tool in the same shell trivially poisons our
 * config — e.g. `LOG_LEVEL=debug` set for some app library suddenly
 * makes the MCP server log every secret-redacted-but-still-noisy
 * request to stderr, and the user has no idea why. With the prefix
 * the boundary is explicit and `env | grep KAMINARI_AD_` enumerates
 * exactly what we read.
 */
const RawSchema = z.object({
  KAMINARI_AD_TRANSPORT: TransportSchema.default("stdio"),
  KAMINARI_AD_API_URL: z.string().url().default("https://kaminari.ad"),
  KAMINARI_AD_LOG_LEVEL: LogLevelSchema.default("info"),
  KAMINARI_AD_LOG_FORMAT: LogFormatSchema.optional(),
  KAMINARI_AD_HTTP_PORT: z.coerce.number().int().min(0).max(65535).default(8080),
  KAMINARI_AD_SESSION_TTL_SEC: z.coerce.number().int().min(60).max(86_400).default(1800),
  KAMINARI_AD_RATE_LIMIT_RPM: z.coerce.number().int().min(1).max(10_000).default(120),
  KAMINARI_AD_API_KEY: z.string().min(8).optional(),
});

/**
 * Parse and validate environment variables into a {@link Config}.
 *
 * Returns `Err<ConfigError>` on validation failure. Caller (typically
 * `bin.ts`) prints the error and exits non-zero.
 *
 * `KAMINARI_AD_LOG_FORMAT` defaults are transport-dependent: `pretty`
 * for stdio (terminal-facing) and `json` for http (aggregator-facing).
 * If the user sets the env var explicitly, that wins.
 */
export function loadConfig(env: NodeJS.ProcessEnv): Result<Config, ConfigError> {
  const parsed = RawSchema.safeParse(env);
  if (!parsed.success) {
    return err({ kind: "invalid", issues: parsed.error.flatten().fieldErrors });
  }
  const raw = parsed.data;
  const transport = raw.KAMINARI_AD_TRANSPORT;
  const logFormat = raw.KAMINARI_AD_LOG_FORMAT ?? (transport === "stdio" ? "pretty" : "json");
  return ok({
    transport,
    apiBaseUrl: raw.KAMINARI_AD_API_URL,
    logLevel: raw.KAMINARI_AD_LOG_LEVEL,
    logFormat,
    httpPort: raw.KAMINARI_AD_HTTP_PORT,
    sessionTtlSec: raw.KAMINARI_AD_SESSION_TTL_SEC,
    rateLimitRpm: raw.KAMINARI_AD_RATE_LIMIT_RPM,
    stdioApiKey: raw.KAMINARI_AD_API_KEY,
  });
}

/**
 * Errors from {@link loadConfig}.
 */
export interface ConfigError {
  readonly kind: "invalid";
  readonly issues: Readonly<Record<string, readonly string[] | undefined>>;
}
