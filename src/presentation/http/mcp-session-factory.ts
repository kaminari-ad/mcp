/**
 * Build a fresh {@link McpServer} + {@link StreamableHTTPServerTransport}
 * pair for a brand-new session.
 *
 * The transport's `onsessioninitialized` callback writes the new
 * session-id into the {@link SessionStore} (binding it to this
 * request's `bearerHash`) and into the in-process `liveSessions` cache
 * so subsequent requests on the same id reuse the same SDK state.
 * `onsessionclosed` and the defensive `onclose` walker free both
 * references when the transport tears down for any reason.
 *
 * Extracted from {@link createHttpRequestHandler} for the same reasons
 * as {@link resolveExistingSession}: under the file-size cap, plus
 * the factory is a natural unit-test seam.
 */

import { randomUUID } from "node:crypto";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import type { ApiGateway } from "../../domain/ports/api-gateway.js";
import type { Logger } from "../../domain/ports/logger.js";
import type { SessionStore } from "../../domain/ports/session-store.js";
import type { BearerToken } from "../../domain/value-objects/bearer-token.js";
import type { RequestId } from "../../domain/value-objects/request-id.js";
import { parseSessionId, type SessionId } from "../../domain/value-objects/session-id.js";
import { NAME, VERSION } from "../../shared/version.js";
import { wireToolsIntoMcpServer } from "../shared/wire-tools.js";

/**
 * Per-session SDK state cached between requests. The transport holds
 * the JSON-RPC initialize/initialized handshake; the `ctxRef` lets the
 * MCP tool callback see a freshly-built `ApiGateway` for each request,
 * because the `Bearer` is per-request even though the transport is
 * per-session.
 */
export interface SessionEntry {
  readonly server: McpServer;
  readonly transport: StreamableHTTPServerTransport;
  readonly ctxRef: { current: { api: ApiGateway; logger: Logger; requestId: RequestId } };
}

export interface InitNewSessionArgs {
  readonly requestId: RequestId;
  readonly reqLogger: Logger;
  readonly liveSessions: Map<SessionId, SessionEntry>;
  readonly sessions: SessionStore;
  readonly bearer: BearerToken;
}

/**
 * Create a fresh MCP server + transport pair, hook it into the
 * session store + cache, and return the cached entry ready for the
 * caller to set `ctxRef.current.api`.
 */
export async function initNewSession(args: InitNewSessionArgs): Promise<SessionEntry> {
  const { reqLogger, liveSessions, sessions, bearer } = args;
  const server = new McpServer({ name: NAME, version: VERSION });

  // `api` is the only field that MUST be overwritten before the first
  // SDK tool callback fires; the calling handler sets it back. The
  // seed value is a sentinel `Proxy` that throws on any property
  // access — guarantees that a buggy code path skipping the overwrite
  // blows up loudly instead of silently calling through to a stale
  // gateway.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const seedTarget = {} as ApiGateway;
  const seedApi = new Proxy(seedTarget, {
    get(): never {
      throw new Error("HttpRequestHandler invariant violated: ctxRef.api not set for this request");
    },
  });
  const ctxRef: SessionEntry["ctxRef"] = {
    current: { api: seedApi, logger: reqLogger, requestId: args.requestId },
  };
  wireToolsIntoMcpServer(server, () => ctxRef.current);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: (): string => randomUUID(),
    enableJsonResponse: true,
    onsessioninitialized: (issued: string): void => {
      const sid = parseSessionId(issued);
      if (sid === undefined) return;
      sessions.bind(sid, bearer.fullHash());
      liveSessions.set(sid, { server, transport, ctxRef });
    },
    onsessionclosed: (closed: string): void => {
      const sid = parseSessionId(closed);
      if (sid === undefined) return;
      sessions.destroy(sid);
      liveSessions.delete(sid);
    },
  });
  transport.onclose = (): void => {
    // Defensive — `onsessionclosed` should already have fired, but if
    // the SDK tore down for any other reason (parse error, IO error)
    // walk the map and drop our cached reference too.
    for (const [sid, entry] of liveSessions) {
      if (entry.transport === transport) liveSessions.delete(sid);
    }
  };

  // @ts-expect-error SDK's Transport.onclose union (() => void) | undefined
  // mismatches Server.connect's expected non-optional type. Harmless;
  // fixed upstream in a future SDK release.
  await server.connect(transport);
  return { server, transport, ctxRef };
}
