import { describe, expect, it } from "vitest";

import { createInMemorySessionStore } from "../../../../src/infrastructure/session/in-memory-session-store.js";
import { newSessionId } from "../../../../src/domain/value-objects/session-id.js";
import { createFakeClock } from "../../../fakes/fake-clock.js";

const TTL = 1_000;

describe("InMemorySessionStore", () => {
  it("binds a fresh session-id to a bearer hash", () => {
    const store = createInMemorySessionStore(createFakeClock(), TTL);
    const id = newSessionId();
    expect(store.bind(id, "h1")).toEqual({ kind: "ok" });
  });

  it("checkAndTouch returns ok and refreshes TTL", () => {
    const clock = createFakeClock();
    const store = createInMemorySessionStore(clock, TTL);
    const id = newSessionId();
    store.bind(id, "h1");
    clock.advance(500);
    expect(store.checkAndTouch(id, "h1")).toEqual({ kind: "ok" });
    // Touched at t=500; another 500ms passes (now t=1000). Without refresh would expire.
    clock.advance(500);
    expect(store.checkAndTouch(id, "h1")).toEqual({ kind: "ok" });
  });

  it("checkAndTouch returns unknown for absent or expired session", () => {
    const clock = createFakeClock();
    const store = createInMemorySessionStore(clock, TTL);
    const id = newSessionId();
    expect(store.checkAndTouch(id, "h1")).toEqual({ kind: "unknown" });
    store.bind(id, "h1");
    clock.advance(TTL + 1);
    expect(store.checkAndTouch(id, "h1")).toEqual({ kind: "unknown" });
    // Expired entry was evicted; a subsequent lookup is also unknown.
    expect(store.checkAndTouch(id, "h1")).toEqual({ kind: "unknown" });
  });

  it("rejects bearer mismatch on checkAndTouch", () => {
    const store = createInMemorySessionStore(createFakeClock(), TTL);
    const id = newSessionId();
    store.bind(id, "h1");
    expect(store.checkAndTouch(id, "h2")).toEqual({ kind: "bound-to-other-bearer" });
  });

  it("bind on an existing slot with a different bearer is rejected", () => {
    const store = createInMemorySessionStore(createFakeClock(), TTL);
    const id = newSessionId();
    store.bind(id, "h1");
    expect(store.bind(id, "h2")).toEqual({ kind: "bound-to-other-bearer" });
  });

  it("bind on the same bearer refreshes the entry", () => {
    const clock = createFakeClock();
    const store = createInMemorySessionStore(clock, TTL);
    const id = newSessionId();
    store.bind(id, "h1");
    clock.advance(500);
    expect(store.bind(id, "h1")).toEqual({ kind: "ok" });
    clock.advance(800); // total elapsed since refresh: 800ms (< TTL); should still be ok
    expect(store.checkAndTouch(id, "h1")).toEqual({ kind: "ok" });
  });

  it("bind reuses an expired slot for any bearer", () => {
    const clock = createFakeClock();
    const store = createInMemorySessionStore(clock, TTL);
    const id = newSessionId();
    store.bind(id, "h1");
    clock.advance(TTL + 1);
    expect(store.bind(id, "h2")).toEqual({ kind: "ok" });
  });

  it("destroy is idempotent", () => {
    const store = createInMemorySessionStore(createFakeClock(), TTL);
    const id = newSessionId();
    store.bind(id, "h1");
    store.destroy(id);
    store.destroy(id);
    expect(store.checkAndTouch(id, "h1")).toEqual({ kind: "unknown" });
  });
});
