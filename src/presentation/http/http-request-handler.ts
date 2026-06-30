/**
 * Per-request HTTP handler for the hosted MCP endpoint.
 *
 * This module is the single place that enforces the tenant-isolation
 * rules from CONTRIBUTING.md. Each rule reference (#N) maps to the
 * corresponding numbered entry there.
 *
 * The function returned by {@link createHttpRequestHandler} is pure
 * over its dependencies — no module-level state, no shared mutable
 * caches across handler factories. Long-lived dependencies
 * (`RateLimiter`, top-level `Logger`) are supplied by the caller
 * (`http-bootstrap.ts`); each request constructs a fresh per-request
 * `ApiGateway` from the incoming Bearer.
 *
 * Stateless transport: every request builds a single-use MCP
 * server + transport (no `Mcp-Session-Id`, no session validation, no
 * cross-request state), handles exactly one request, and closes both.
 * Any replica can serve any request — no sticky routing. Each request
 * is independently authenticated by its own Bearer, so there is no
 * session to hijack (rule #7).
 */

import type { IncomingMessage, ServerResponse } from "node:http";

import type { Logger } from "../../domain/ports/logger.js";
import type { RateLimiter } from "../../domain/ports/rate-limiter.js";
import { BearerToken } from "../../domain/value-objects/bearer-token.js";
import { newRequestId } from "../../domain/value-objects/request-id.js";
import { createHttpApiGateway } from "../../infrastructure/api/http-api-gateway.js";
import type { Config } from "../../shared/config.js";
import { createStatelessMcp } from "./create-stateless-mcp.js";
import { respondWithProtectedResourceMetadata } from "./protected-resource-metadata-handler.js";
import { buildBearerChallenge } from "./www-authenticate.js";

export interface HttpRequestHandlerDeps {
  readonly config: Config;
  readonly logger: Logger;
  readonly rateLimiter: RateLimiter;
}

/**
 * Build the per-request handler. Returns an async function with the
 * Node `http.Server` request-handler signature.
 */
export function createHttpRequestHandler(
  deps: HttpRequestHandlerDeps
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { config, logger, rateLimiter } = deps;

  // Pre-computed per process: the WWW-Authenticate challenge string is
  // purely a function of `Config` (resource-metadata URL + scopes).
  // Computing it once avoids string-building on every unauthenticated
  // request (rule #1 — a const closure, not module-level mutable state).
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

    // Rule #6 — missing Authorization is rejected without touching the
    // API. The `WWW-Authenticate` header is required by the MCP
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

    // Rule #3 — per-request ApiGateway, holding only this request's Bearer.
    const api = createHttpApiGateway({
      baseUrl: config.apiBaseUrl,
      bearer,
      requestId,
      logger: reqLogger,
    });

    // Single-use stateless MCP for this request. Closed on response end
    // so the per-request SDK objects don't leak.
    const { server, transport } = await createStatelessMcp({ api, logger: reqLogger, requestId });
    res.on("close", () => {
      void transport.close().catch(() => undefined);
      void server.close().catch(() => undefined);
    });

    try {
      await transport.handleRequest(req, res);
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
