/**
 * Look up a cached MCP session entry for an incoming `Mcp-Session-Id`
 * header, verifying tenant binding via the {@link SessionStore}.
 *
 * Extracted from {@link createHttpRequestHandler} so the handler stays
 * under the project's 200-effective-line cap and the session-lookup
 * branch can be unit-tested in isolation.
 *
 * Returns one of:
 *   - `undefined` — no session header. Caller mints a fresh session.
 *   - `"rejected"` — bad / wrong-bearer / expired session. The
 *     response has already been written.
 *   - `SessionEntry` — found, bearer matches, ready to reuse.
 */

import type { ServerResponse } from "node:http";

import type { Logger } from "../../domain/ports/logger.js";
import type { SessionStore } from "../../domain/ports/session-store.js";
import { decideSessionAction } from "../../domain/services/session-binding-policy.js";
import type { BearerToken } from "../../domain/value-objects/bearer-token.js";
import { parseSessionId, type SessionId } from "../../domain/value-objects/session-id.js";
import type { SessionEntry } from "./mcp-session-factory.js";

export interface SessionResolverArgs {
  readonly sessionIdRaw: string | undefined;
  readonly bearer: BearerToken;
  readonly reqLogger: Logger;
  readonly sessions: SessionStore;
  readonly liveSessions: Map<SessionId, SessionEntry>;
  readonly res: ServerResponse;
}

export type ResolveResult = SessionEntry | undefined | "rejected";

/**
 * Resolve the cached session for this request, or signal rejection.
 *
 * Writes the response body itself only when rejecting (400 / 401);
 * otherwise the caller is responsible for handing the request to the
 * SDK transport.
 */
export async function resolveExistingSession(args: SessionResolverArgs): Promise<ResolveResult> {
  const { sessionIdRaw, bearer, reqLogger, sessions, liveSessions, res } = args;
  if (sessionIdRaw === undefined) return undefined;

  const sessionId = parseSessionId(sessionIdRaw);
  if (sessionId === undefined) {
    writeJson(res, 400, { error: "Invalid Mcp-Session-Id" });
    return "rejected";
  }

  const action = decideSessionAction(sessions.checkAndTouch(sessionId, bearer.fullHash()));
  if (action.kind === "reject-bearer-mismatch") {
    sessions.destroy(sessionId);
    const evicted = liveSessions.get(sessionId);
    liveSessions.delete(sessionId);
    if (evicted !== undefined) await evicted.transport.close().catch(() => undefined);
    reqLogger.warn({}, "http.session_bearer_mismatch");
    writeJson(res, 401, { error: "Session bound to a different bearer" });
    return "rejected";
  }

  const cached = liveSessions.get(sessionId);
  if (cached !== undefined && action.kind === "allow") return cached;

  // Session unknown (TTL-evicted or never-initialised) — drop any
  // stale transport and let the caller mint a fresh one. The SDK will
  // respond 400 if the client tried to skip `initialize`.
  if (cached !== undefined) {
    liveSessions.delete(sessionId);
    await cached.transport.close().catch(() => undefined);
  }
  return undefined;
}

function writeJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}
