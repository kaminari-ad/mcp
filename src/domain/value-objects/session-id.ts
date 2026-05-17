/**
 * MCP `Mcp-Session-Id` header value, issued by the server on a
 * successful `initialize` and presented by the client on every
 * subsequent request.
 *
 * Branded so it can't be confused with a {@link RequestId} or any
 * other string ID flowing through the system.
 */

import { randomUUID } from "node:crypto";

declare const sessionIdBrand: unique symbol;

export type SessionId = string & { readonly [sessionIdBrand]: never };

const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Generate a fresh session ID. UUID v4.
 */
export function newSessionId(): SessionId {
  return randomUUID() as SessionId;
}

/**
 * Parse a client-supplied `Mcp-Session-Id` header. Returns `undefined`
 * for malformed input — the transport then rejects the request 400.
 */
export function parseSessionId(raw: string): SessionId | undefined {
  return SESSION_ID_RE.test(raw) ? (raw as SessionId) : undefined;
}
