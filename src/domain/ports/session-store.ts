/**
 * MCP session-id <-> bearer-hash binding store.
 *
 * Enforces tenant-isolation hard rule #9 (CONTRIBUTING.md): once a
 * session is initialised with Bearer A, subsequent requests on the
 * same session-id from Bearer B must be rejected and the session
 * destroyed.
 *
 * The store holds ONLY hashes — never the raw token, never any user
 * data. Sessions expire after an idle TTL set in {@link Config}.
 */

import type { SessionId } from "../value-objects/session-id.js";

/**
 * Result of {@link SessionStore.checkAndTouch}.
 */
export type SessionCheck =
  | { readonly kind: "ok" }
  | { readonly kind: "unknown" }
  | { readonly kind: "bound-to-other-bearer" };

export interface SessionStore {
  /**
   * Bind a freshly-issued `sessionId` to the given `bearerHash`. If
   * the session already exists for a DIFFERENT bearerHash, return
   * `{ kind: "bound-to-other-bearer" }` and leave the existing binding
   * untouched (callers reject the request and destroy the session
   * separately via {@link destroy}).
   */
  bind(sessionId: SessionId, bearerHash: string): SessionCheck;

  /**
   * Verify an incoming request: the session must exist, and its bound
   * bearerHash must match. On success, the session's idle timer is
   * reset (touched).
   */
  checkAndTouch(sessionId: SessionId, bearerHash: string): SessionCheck;

  /**
   * Drop the session by id. Idempotent.
   */
  destroy(sessionId: SessionId): void;
}
