/**
 * Pure decision policy: given the result of a {@link SessionStore}
 * lookup, what action should the transport take?
 *
 * Returned as a `SessionAction` union the transport switches on. No
 * I/O, no logging, no side effects.
 *
 * The transport (the only caller) then performs the action: continue,
 * destroy + 401, or 400.
 */

import type { SessionCheck } from "../ports/session-store.js";

export type SessionAction =
  /** Session is valid for this bearer; continue processing. */
  | { readonly kind: "allow" }
  /** Session-id unknown — likely the client never `initialize`d. */
  | { readonly kind: "unknown-session" }
  /**
   * Session-id is bound to a different bearer (potential token-swap
   * attack). Caller MUST destroy the session and respond 401.
   */
  | { readonly kind: "reject-bearer-mismatch" };

/**
 * Map a raw {@link SessionCheck} into a {@link SessionAction}.
 *
 * @param check - The store's verdict.
 * @returns The action the transport must take.
 */
export function decideSessionAction(check: SessionCheck): SessionAction {
  switch (check.kind) {
    case "ok":
      return { kind: "allow" };
    case "unknown":
      return { kind: "unknown-session" };
    case "bound-to-other-bearer":
      return { kind: "reject-bearer-mismatch" };
  }
}
