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
 * Parsed configuration. All fields are `readonly` — mutation post-load
 * is a bug.
 */
export interface Config {
  readonly transport: Transport;
  readonly apiBaseUrl: string;
  readonly logLevel: LogLevel;
  readonly httpPort: number;
  readonly sessionTtlSec: number;
  readonly rateLimitRpm: number;
  /**
   * Set only in stdio mode. In HTTP mode the bootstrap MUST assert
   * this is `undefined` (see CONTRIBUTING.md "Tenant isolation" §5).
   */
  readonly stdioApiKey: string | undefined;
}

const RawSchema = z.object({
  TRANSPORT: TransportSchema.default("stdio"),
  API_BASE_URL: z.string().url().default("https://kaminari.ad"),
  LOG_LEVEL: LogLevelSchema.default("info"),
  HTTP_PORT: z.coerce.number().int().min(0).max(65535).default(8080),
  SESSION_TTL_SEC: z.coerce.number().int().min(60).max(86_400).default(1800),
  RATE_LIMIT_RPM: z.coerce.number().int().min(1).max(10_000).default(120),
  KAMINARI_AD_API_KEY: z.string().min(8).optional(),
});

/**
 * Parse and validate environment variables into a {@link Config}.
 *
 * Returns `Err<ConfigError>` on validation failure. Caller (typically
 * `bin.ts`) prints the error and exits non-zero.
 */
export function loadConfig(env: NodeJS.ProcessEnv): Result<Config, ConfigError> {
  const parsed = RawSchema.safeParse(env);
  if (!parsed.success) {
    return err({ kind: "invalid", issues: parsed.error.flatten().fieldErrors });
  }
  const raw = parsed.data;
  return ok({
    transport: raw.TRANSPORT,
    apiBaseUrl: raw.API_BASE_URL,
    logLevel: raw.LOG_LEVEL,
    httpPort: raw.HTTP_PORT,
    sessionTtlSec: raw.SESSION_TTL_SEC,
    rateLimitRpm: raw.RATE_LIMIT_RPM,
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
