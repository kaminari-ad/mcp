/**
 * Per-request HTTP handler for the hosted MCP endpoint.
 *
 * This module is the single place that enforces the 16 tenant-isolation
 * rules from CONTRIBUTING.md. Each rule reference (#N) maps to the
 * corresponding numbered entry there.
 *
 * The function returned by {@link createHttpRequestHandler} is pure
 * over its dependencies — no module-level state, no shared mutable
 * caches. Long-lived dependencies (`SessionStore`, `RateLimiter`,
 * top-level `Logger`) are supplied by the caller (`http-bootstrap.ts`),
 * and each request constructs a fresh per-request `ApiGateway` from
 * the incoming Bearer.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { BearerToken } from "../../domain/value-objects/bearer-token.js";
import { newRequestId } from "../../domain/value-objects/request-id.js";
import { parseSessionId } from "../../domain/value-objects/session-id.js";
import type { Logger } from "../../domain/ports/logger.js";
import type { RateLimiter } from "../../domain/ports/rate-limiter.js";
import type { SessionStore } from "../../domain/ports/session-store.js";
import { decideSessionAction } from "../../domain/services/session-binding-policy.js";
import { createHttpApiGateway } from "../../infrastructure/api/http-api-gateway.js";
import type { Config } from "../../shared/config.js";
import { NAME, VERSION } from "../../shared/version.js";

import { wireToolsIntoMcpServer } from "../shared/wire-tools.js";

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

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // Rule #16 — health probe carries no tenant data and needs no auth.
    if (req.method === "GET" && req.url === "/healthz") {
      writeJson(res, 200, { status: "ok" });
      return;
    }

    if (req.url !== "/mcp" || (req.method !== "POST" && req.method !== "GET" && req.method !== "DELETE")) {
      writeJson(res, 404, { error: "Not found" });
      return;
    }

    // Rule #6 — missing Authorization is rejected without touching the API.
    const authHeader = first(req.headers["authorization"]);
    const bearer = BearerToken.fromAuthorizationHeader(authHeader);
    if (bearer === undefined) {
      writeJson(res, 401, { error: "Authorization Bearer token required" });
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
      const headers = rate.retryAfterMs !== undefined
        ? { "retry-after": String(Math.ceil(rate.retryAfterMs / 1000)) }
        : {};
      writeJson(res, 429, { error: "Rate limited" }, headers);
      return;
    }

    // Rule #9 — session-id binding: existing sessions are pinned to the
    // bearer that initialised them; a different bearer is rejected and
    // the session destroyed.
    const sessionIdRaw = first(req.headers["mcp-session-id"]);
    if (sessionIdRaw !== undefined) {
      const sessionId = parseSessionId(sessionIdRaw);
      if (sessionId === undefined) {
        writeJson(res, 400, { error: "Invalid Mcp-Session-Id" });
        return;
      }
      const action = decideSessionAction(
        sessions.checkAndTouch(sessionId, bearer.fullHash())
      );
      if (action.kind === "reject-bearer-mismatch") {
        sessions.destroy(sessionId);
        reqLogger.warn({}, "http.session_bearer_mismatch");
        writeJson(res, 401, { error: "Session bound to a different bearer" });
        return;
      }
      // `unknown-session` is allowed through — the SDK will treat it as
      // a fresh initialize (or reject as malformed if not). We do not
      // pre-validate session state beyond the bearer check.
    }

    // Rule #3 — per-request ApiGateway, holding only this request's Bearer.
    const api = createHttpApiGateway({
      baseUrl: config.apiBaseUrl,
      bearer,
      requestId,
      logger: reqLogger,
    });

    // Rule #10 — a fresh McpServer per request avoids any chance of
    // cross-request state on the SDK side.
    const server = new McpServer({ name: NAME, version: VERSION });
    wireToolsIntoMcpServer(server, () => ({ api, logger: reqLogger, requestId }));

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => requestId, // request-scoped; SDK uses this for response correlation
      enableJsonResponse: true,
    });

    try {
      // @ts-expect-error SDK's Transport.onclose union (() => void) | undefined
      // mismatches Server.connect's expected non-optional type. Harmless;
      // fixed upstream in a future SDK release.
      await server.connect(transport);
      await transport.handleRequest(req, res);
      // On a fresh initialize the SDK has now emitted a session-id on
      // the response. Bind it to this bearer so the NEXT request on
      // the same session is locked in.
      const issued = first(res.getHeader("mcp-session-id"));
      if (typeof issued === "string") {
        const sid = parseSessionId(issued);
        if (sid !== undefined) sessions.bind(sid, bearer.fullHash());
      }
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
