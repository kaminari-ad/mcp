/**
 * In-memory implementation of {@link SessionStore}.
 *
 * Holds entries keyed by `Mcp-Session-Id`, valued by
 * `{ bearerHash, expiresAtMs }`. The bearer hash is what makes
 * tenant-isolation rule #9 work: a session bound to bearer A cannot be
 * re-used by bearer B.
 *
 * State characteristics:
 *   - Per-process, in-memory only. Not durable; restart wipes sessions.
 *   - Idle TTL: the entry is refreshed on every successful checkAndTouch.
 *   - No background cleanup task — entries die lazily on access. Old
 *     entries linger until the next request inquires about them OR a
 *     fresh `bind` overwrites the slot. Memory grows at O(active
 *     bearers within TTL window), which is acceptable at MCP scale.
 *
 * No tenant data ever lives in this store — only short hex hashes.
 */

import type { Clock } from "../../domain/ports/clock.js";
import type { SessionCheck, SessionStore } from "../../domain/ports/session-store.js";
import type { SessionId } from "../../domain/value-objects/session-id.js";

interface Entry {
  readonly bearerHash: string;
  expiresAtMs: number;
}

/**
 * Build an in-memory session store.
 *
 * @param clock   - Clock used to compute expiry. Injected for tests.
 * @param ttlMs   - Idle TTL in milliseconds. After this much elapsed
 *                  time without a checkAndTouch the entry is treated
 *                  as expired.
 */
export function createInMemorySessionStore(clock: Clock, ttlMs: number): SessionStore {
  const entries = new Map<SessionId, Entry>();

  function isExpired(entry: Entry): boolean {
    return entry.expiresAtMs < clock.nowMs();
  }

  return {
    bind(sessionId: SessionId, bearerHash: string): SessionCheck {
      const existing = entries.get(sessionId);
      if (existing !== undefined && !isExpired(existing)) {
        if (existing.bearerHash !== bearerHash) {
          return { kind: "bound-to-other-bearer" };
        }
        existing.expiresAtMs = clock.nowMs() + ttlMs;
        return { kind: "ok" };
      }
      entries.set(sessionId, { bearerHash, expiresAtMs: clock.nowMs() + ttlMs });
      return { kind: "ok" };
    },

    checkAndTouch(sessionId: SessionId, bearerHash: string): SessionCheck {
      const entry = entries.get(sessionId);
      if (entry === undefined || isExpired(entry)) {
        if (entry !== undefined) entries.delete(sessionId);
        return { kind: "unknown" };
      }
      if (entry.bearerHash !== bearerHash) {
        return { kind: "bound-to-other-bearer" };
      }
      entry.expiresAtMs = clock.nowMs() + ttlMs;
      return { kind: "ok" };
    },

    destroy(sessionId: SessionId): void {
      entries.delete(sessionId);
    },
  };
}
