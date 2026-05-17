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
 *   - Opportunistic sweep on `bind`: every {@link SWEEP_EVERY_N_BINDS}
 *     binds we walk the map and evict every expired entry. Prevents
 *     unbounded growth when sessions are created but never re-visited
 *     (a common pattern when clients reconnect with a fresh session id
 *     instead of resuming the old one). Lazy in steady state, bounded
 *     in worst case by `2 * SWEEP_EVERY_N_BINDS` extra map entries.
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
 * How often (in `bind()` calls) the store walks its own map to evict
 * expired entries. Picked low enough that a one-shot client storm of
 * never-revisited sessions cannot grow the map past ~2x this value.
 */
const SWEEP_EVERY_N_BINDS = 128;

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
  let bindCount = 0;

  function isExpired(entry: Entry): boolean {
    return entry.expiresAtMs < clock.nowMs();
  }

  function sweepIfDue(): void {
    bindCount += 1;
    if (bindCount % SWEEP_EVERY_N_BINDS !== 0) return;
    const now = clock.nowMs();
    for (const [id, entry] of entries) {
      if (entry.expiresAtMs < now) entries.delete(id);
    }
  }

  return {
    bind(sessionId: SessionId, bearerHash: string): SessionCheck {
      sweepIfDue();
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
