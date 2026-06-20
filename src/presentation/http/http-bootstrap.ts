/**
 * Composition root for the HTTP transport.
 *
 * Wires the long-lived per-process dependencies (logger, session store,
 * rate limiter) and hands the per-request handling off to
 * {@link createHttpRequestHandler} — which enforces every
 * tenant-isolation rule from CONTRIBUTING.md.
 *
 * Invariants enforced by this bootstrap itself:
 *
 *   - Rule #5: `KAMINARI_AD_API_KEY` env var is REJECTED in HTTP mode.
 *     If present, the process exits non-zero on startup so it can never
 *     accidentally serve a default-Bearer fallback.
 *   - Rule #1: every binding here is `const`. No module-level mutables.
 *   - Rule #15: no telemetry SDK wired by default.
 */

import { createServer } from "node:http";
import process from "node:process";

import { createSystemClock } from "../../infrastructure/clock/system-clock.js";
import { createPinoLogger } from "../../infrastructure/logging/pino-logger.js";
import { createLeakyBucketRateLimiter } from "../../infrastructure/rate-limit/leaky-bucket-rate-limiter.js";
import { createInMemorySessionStore } from "../../infrastructure/session/in-memory-session-store.js";
import type { Config } from "../../shared/config.js";
import { createHttpRequestHandler } from "./http-request-handler.js";

/**
 * Build and start the HTTP MCP server. Resolves with a process exit
 * code when the server shuts down (SIGTERM / SIGINT).
 */
export async function bootstrapHttp(config: Config): Promise<number> {
  const logger = createPinoLogger(config.logLevel, config.logFormat);

  // Rule #5 — KAMINARI_AD_API_KEY is stdio-only. Refuse to start with
  // it set in HTTP mode so we never serve a default-Bearer fallback.
  if (config.stdioApiKey !== undefined) {
    logger.fatal({}, "http.api_key_env_forbidden");
    return 2;
  }

  const clock = createSystemClock();
  const sessions = createInMemorySessionStore(clock, config.sessionTtlSec * 1000);
  const rateLimiter = createLeakyBucketRateLimiter(clock, config.rateLimitRpm);

  const handle = createHttpRequestHandler({ config, logger, sessions, rateLimiter });

  const httpServer = createServer((req, res) => {
    // Security headers (moved from the rnd edge so mcp.kaminari.ad is
    // self-contained). Set on every response before handling; they persist
    // through the handler's writeHead (distinct keys). No CORS / no
    // org-identifying headers per CONTRIBUTING.md rules #8 / #12.
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    handle(req, res).catch((cause: unknown) => {
      logger.error(
        { error_message: cause instanceof Error ? cause.message : String(cause) },
        "http.unhandled"
      );
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(config.httpPort, () => {
      logger.info({ http_port: config.httpPort }, "http.ready");
      resolve();
    });
  });

  await new Promise<void>((resolve) => {
    const onSignal = (): void => {
      logger.info({}, "http.shutdown");
      httpServer.close(() => {
        resolve();
      });
    };
    process.once("SIGTERM", onSignal);
    process.once("SIGINT", onSignal);
  });
  return 0;
}
