/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §6.
 *
 * A request without `Authorization` is rejected with HTTP 401 BEFORE
 * any outbound call to the Kaminari Ad API is made.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { jsonRpc, spinUpServer, undiciRequest } from "./_helpers/spin-up-server.js";

describe("isolation: missing Authorization", () => {
  let harness: Awaited<ReturnType<typeof spinUpServer>>;

  beforeEach(async () => {
    harness = await spinUpServer();
  });
  afterEach(async () => {
    await harness.close();
  });

  it("rejects POST /mcp without Authorization (401, no API call)", async () => {
    // No `intercept` registered → if MCP tried to call the API, undici
    // would reject (MockAgent has disableNetConnect).
    const res = await jsonRpc(harness.origin, {}, { jsonrpc: "2.0", method: "tools/list", id: 1 });
    expect(res.statusCode).toBe(401);
  });

  it("rejects POST /mcp with non-Bearer Authorization", async () => {
    const res = await jsonRpc(
      harness.origin,
      { authorization: "Basic xyz" },
      { jsonrpc: "2.0", method: "tools/list", id: 1 }
    );
    expect(res.statusCode).toBe(401);
  });

  it("rejects with empty Bearer value", async () => {
    const res = await jsonRpc(
      harness.origin,
      { authorization: "Bearer  " },
      { jsonrpc: "2.0", method: "tools/list", id: 1 }
    );
    expect(res.statusCode).toBe(401);
  });

  it("GET /healthz works without auth (rule §16)", async () => {
    const res = await undiciRequest(`${harness.origin}/healthz`);
    expect(res.statusCode).toBe(200);
    const body = (await res.body.json()) as { status: string };
    expect(body).toEqual({ status: "ok" });
  });

  it("unknown paths return 404 without auth", async () => {
    const res = await undiciRequest(`${harness.origin}/nope`);
    expect(res.statusCode).toBe(404);
  });
});
