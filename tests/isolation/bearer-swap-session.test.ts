/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §9.
 *
 * Once a session-id is bound to Bearer A, a request reusing the same
 * session-id with Bearer B is rejected (401) and the session is
 * destroyed. Asserts via the SessionStore directly — exercises the
 * exact code path used by the HTTP handler.
 */

import { describe, expect, it } from "vitest";

import { createInMemorySessionStore } from "../../src/infrastructure/session/in-memory-session-store.js";
import { decideSessionAction } from "../../src/domain/services/session-binding-policy.js";
import { newSessionId } from "../../src/domain/value-objects/session-id.js";
import { createFakeClock } from "../fakes/fake-clock.js";

describe("isolation: bearer-swap session rejection", () => {
  it("a session bound to Bearer A is rejected when presented with Bearer B", () => {
    const store = createInMemorySessionStore(createFakeClock(), 30_000);
    const id = newSessionId();
    store.bind(id, "hash-A");
    const action = decideSessionAction(store.checkAndTouch(id, "hash-B"));
    expect(action).toEqual({ kind: "reject-bearer-mismatch" });
  });

  it("destroying the session prevents further use even by the original bearer", () => {
    const store = createInMemorySessionStore(createFakeClock(), 30_000);
    const id = newSessionId();
    store.bind(id, "hash-A");
    store.destroy(id);
    const action = decideSessionAction(store.checkAndTouch(id, "hash-A"));
    expect(action).toEqual({ kind: "unknown-session" });
  });

  it("an expired session is treated as unknown, not as a bearer mismatch", () => {
    const clock = createFakeClock();
    const store = createInMemorySessionStore(clock, 1_000);
    const id = newSessionId();
    store.bind(id, "hash-A");
    clock.advance(1_001);
    const action = decideSessionAction(store.checkAndTouch(id, "hash-B"));
    expect(action).toEqual({ kind: "unknown-session" });
  });

  it("the same bearer can reuse its session repeatedly until TTL", () => {
    const clock = createFakeClock();
    const store = createInMemorySessionStore(clock, 10_000);
    const id = newSessionId();
    store.bind(id, "hash-A");
    for (let i = 0; i < 5; i += 1) {
      clock.advance(1_000);
      expect(decideSessionAction(store.checkAndTouch(id, "hash-A"))).toEqual({ kind: "allow" });
    }
  });
});
