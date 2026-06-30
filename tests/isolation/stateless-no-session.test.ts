/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §7 — the HTTP
 * transport is stateless.
 *
 * The server runs `StreamableHTTPServerTransport` with
 * `sessionIdGenerator: undefined`, so:
 *   - `initialize` issues NO `Mcp-Session-Id` header, and
 *   - subsequent requests (`tools/list`) succeed with no session id —
 *     they are NOT rejected with a 400 "session required" / "Server not
 *     initialized" error.
 *
 * This is what lets any replica serve any request behind a round-robin
 * load balancer (no sticky sessions) and removes the per-pod session
 * state that broke MCP mid-session after the Traefik cutover.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { type IsolationHarness, jsonRpc, spinUpServer } from "./_helpers/spin-up-server.js";

const AUTH = { authorization: "Bearer kad_test_stateless_token" } as const;

interface ToolsListBody {
  readonly error?: unknown;
  readonly result?: { readonly tools?: readonly unknown[] };
}

describe("isolation: stateless transport — no sessions", () => {
  let harness: IsolationHarness;

  beforeEach(async () => {
    harness = await spinUpServer();
  });
  afterEach(async () => {
    await harness.close();
  });

  it("initialize issues no Mcp-Session-Id header", async () => {
    const res = await jsonRpc(harness.origin, AUTH, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "stateless-test", version: "0" },
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["mcp-session-id"]).toBeUndefined();
  });

  it("tools/list succeeds with no session id (not a 400 session error)", async () => {
    const res = await jsonRpc(harness.origin, AUTH, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["mcp-session-id"]).toBeUndefined();
    const body = res.body as ToolsListBody;
    expect(body.error).toBeUndefined();
    expect(Array.isArray(body.result?.tools)).toBe(true);
    expect(body.result?.tools?.length ?? 0).toBeGreaterThan(50);
  });

  it("different bearers each get an independent stateless response", async () => {
    const a = await jsonRpc(
      harness.origin,
      { authorization: "Bearer kad_test_bearer_aaaaaaa" },
      { jsonrpc: "2.0", id: 3, method: "tools/list", params: {} }
    );
    const b = await jsonRpc(
      harness.origin,
      { authorization: "Bearer kad_test_bearer_bbbbbbb" },
      { jsonrpc: "2.0", id: 4, method: "tools/list", params: {} }
    );

    expect(a.statusCode).toBe(200);
    expect(b.statusCode).toBe(200);
    expect(a.headers["mcp-session-id"]).toBeUndefined();
    expect(b.headers["mcp-session-id"]).toBeUndefined();
    expect((a.body as ToolsListBody).error).toBeUndefined();
    expect((b.body as ToolsListBody).error).toBeUndefined();
  });
});
