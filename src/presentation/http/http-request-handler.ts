/**
 * Per-request HTTP handler for the hosted MCP endpoint.
 *
 * This module is the single place that enforces the 16 tenant-isolation
 * rules from CONTRIBUTING.md. Each rule reference (#N) maps to the
 * corresponding numbered entry there.
 *
 * The function returned by {@link createHttpRequestHandler} is pure
 * over its dependencies — no module-level state, no shared mutable
 * caches across handler factories. Long-lived dependencies
 * (`SessionStore`, `RateLimiter`, top-level `Logger`) are supplied by
 * the caller (`http-bootstrap.ts`), and each request constructs a
 * fresh per-request `ApiGateway` from the incoming Bearer.
 *
 * Session lifecycle (Streamable HTTP):
 *
 *   1. First POST (`initialize`) — no `Mcp-Session-Id` header. We
 *      build a fresh {@link McpServer} + {@link StreamableHTTPServerTransport}
 *      via {@link initNewSession}, let the SDK generate a session id,
 *      then bind it to `bearerHash` in {@link SessionStore} and cache
 *      the transport so the next request on the same session reuses
 *      the same SDK state.
 *   2. Subsequent requests on the same session — same bearer ⇒ reuse
 *      the cached transport (rule #9 enforced via `SessionStore`
 *      bearer-hash equality); different bearer ⇒ destroy the session
 *      and respond 401.
 *   3. Session close — when the SDK fires `transport.onclose` (client
 *      sent DELETE /mcp, or session TTL expired and we evicted) we
 *      drop the transport from the cache to free memory.
 *
 * Rule #10 ("fresh state per tenant") still holds: every cached
 * transport is bound to exactly one bearer (rule #9), and any attempt
 * to reuse a session id with a different bearer is rejected before any
 * SDK code runs.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

import type { Logger } from "../../domain/ports/logger.js";
import type { RateLimiter } from "../../domain/ports/rate-limiter.js";
import type { SessionStore } from "../../domain/ports/session-store.js";
import { BearerToken } from "../../domain/value-objects/bearer-token.js";
import { newRequestId } from "../../domain/value-objects/request-id.js";
import type { SessionId } from "../../domain/value-objects/session-id.js";
import { createHttpApiGateway } from "../../infrastructure/api/http-api-gateway.js";
import type { Config } from "../../shared/config.js";
import { initNewSession, type SessionEntry } from "./mcp-session-factory.js";
import { respondWithProtectedResourceMetadata } from "./protected-resource-metadata-handler.js";
import { resolveExistingSession } from "./session-resolver.js";
import { buildBearerChallenge } from "./www-authenticate.js";

export interface HttpRequestHandlerDeps {
  readonly config: Config;
  readonly logger: Logger;
  readonly sessions: SessionStore;
  readonly rateLimiter: RateLimiter;
}

/**
 * Build the per-request handler. Returns an async function with the
 * Node `http.Server` request-handler signature.
 */
export function createHttpRequestHandler(
  deps: HttpRequestHandlerDeps
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { config, logger, sessions, rateLimiter } = deps;

  // Transport cache. Closed over by the handler — one cache per
  // bootstrap, never shared across factories. Cleared on transport
  // close (see `mcp-session-factory.ts`).
  const liveSessions = new Map<SessionId, SessionEntry>();

  // Pre-computed per process: the WWW-Authenticate challenge string
  // is purely a function of `Config` (resource-metadata URL +
  // scopes). Computing it once here avoids string-building on every
  // unauthenticated request and matches rule #1 (the value is a const
  // closure, not module-level mutable state).
  const bearerChallenge = buildBearerChallenge(config);

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // Rule #16 — health probe carries no tenant data and needs no auth.
    if (req.method === "GET" && req.url === "/healthz") {
      writeJson(res, 200, { status: "ok" });
      return;
    }

    // RFC 9728 protected-resource metadata. Same data-free, no-auth
    // pattern as /healthz — see protected-resource-metadata-handler.ts.
    if (req.method === "GET" && req.url === "/.well-known/oauth-protected-resource") {
      respondWithProtectedResourceMetadata(res, config);
      return;
    }

    if (
      req.url !== "/mcp" ||
      (req.method !== "POST" && req.method !== "GET" && req.method !== "DELETE")
    ) {
      writeJson(res, 404, { error: "Not found" });
      return;
    }

    // Rule #6 — missing Authorization is rejected without touching
    // the API. The `WWW-Authenticate` header is required by the MCP
    // authorization spec / Anthropic Claude clients to discover the
    // RFC 9728 protected-resource metadata document.
    const authHeader = first(req.headers.authorization);
    const bearer = BearerToken.fromAuthorizationHeader(authHeader);
    if (bearer === undefined) {
      writeJson(
        res,
        401,
        { error: "Authorization Bearer token required" },
        { "www-authenticate": bearerChallenge }
      );
      return;
    }

    const requestId = newRequestId();
    const bearerHash = bearer.hash();
    const reqLogger = logger.child({ request_id: requestId, bearer_hash: bearerHash });

    // Rule #14 — per-bearer rate limit, checked before any API work.
    const rate = rateLimiter.check(bearer.fullHash());
    if (!rate.allowed) {
      reqLogger.warn(
        { rate_limited: true, retry_after_ms: rate.retryAfterMs ?? 0 },
        "http.rate_limited"
      );
      const headers =
        rate.retryAfterMs !== undefined
          ? { "retry-after": String(Math.ceil(rate.retryAfterMs / 1000)) }
          : {};
      writeJson(res, 429, { error: "Rate limited" }, headers);
      return;
    }

    const sessionIdRaw = first(req.headers["mcp-session-id"]);
    const existingEntry = await resolveExistingSession({
      sessionIdRaw,
      bearer,
      reqLogger,
      sessions,
      liveSessions,
      res,
    });
    if (existingEntry === "rejected") return;

    // Rule #3 — per-request ApiGateway, holding only this request's Bearer.
    const api = createHttpApiGateway({
      baseUrl: config.apiBaseUrl,
      bearer,
      requestId,
      logger: reqLogger,
    });

    const entry =
      existingEntry ??
      (await initNewSession({ requestId, reqLogger, liveSessions, sessions, bearer }));

    // Swap the per-request context BEFORE handing off to the SDK so
    // the tool callback's lexical-closure read sees this request's
    // gateway.
    entry.ctxRef.current = { api, logger: reqLogger, requestId };

    try {
      await entry.transport.handleRequest(req, res);
      reqLogger.info({}, "http.request_done");
    } catch (cause) {
      reqLogger.error(
        { error_message: cause instanceof Error ? cause.message : "unknown" },
        "http.handler_error"
      );
      if (!res.headersSent) {
        writeJson(res, 500, { error: "Internal server error" });
      }
    }
  }

  return handle;
}

function writeJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  extraHeaders: Readonly<Record<string, string>> = {}
): void {
  res.writeHead(status, { "content-type": "application/json", ...extraHeaders });
  res.end(JSON.stringify(body));
}

function first(headerValue: string | string[] | number | undefined): string | undefined {
  if (headerValue === undefined) return undefined;
  if (Array.isArray(headerValue)) return headerValue[0];
  if (typeof headerValue === "number") return String(headerValue);
  return headerValue;
}
