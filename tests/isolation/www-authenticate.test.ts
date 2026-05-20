/**
 * Isolation test: WWW-Authenticate envelope on 401 responses.
 *
 * The MCP authorization spec (Anthropic Claude clients) discovers our
 * Authorization Server via the `WWW-Authenticate: Bearer
 * resource_metadata="…"` header returned on any unauthenticated
 * request. Without it, Claude cannot complete the OAuth handshake and
 * the directory connection fails with "Couldn't reach the MCP
 * server."
 *
 * Asserts the header is present on every 401 path: missing
 * Authorization, malformed Bearer, empty token.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { jsonRpc, spinUpServer } from "./_helpers/spin-up-server.js";

describe("isolation: WWW-Authenticate Bearer challenge on 401", () => {
  let harness: Awaited<ReturnType<typeof spinUpServer>>;

  beforeEach(async () => {
    harness = await spinUpServer();
  });
  afterEach(async () => {
    await harness.close();
  });

  it("missing Authorization → 401 + WWW-Authenticate header pointing at PRM", async () => {
    const res = await jsonRpc(harness.origin, {}, { jsonrpc: "2.0", method: "tools/list", id: 1 });
    expect(res.statusCode).toBe(401);
    const header = res.headers["www-authenticate"];
    expect(typeof header).toBe("string");
    // Bearer scheme + resource_metadata pointer + scope list. The
    // exact string is asserted to surface accidental drift.
    expect(header).toBe(
      'Bearer resource_metadata="https://mcp.kaminari.ad/.well-known/oauth-protected-resource", scope="mcp:scans:read mcp:scans:write mcp:campaigns:read mcp:campaigns:write mcp:billing:read mcp:webhooks:write offline_access"'
    );
  });

  it("non-Bearer Authorization → 401 + same WWW-Authenticate", async () => {
    const res = await jsonRpc(
      harness.origin,
      { authorization: "Basic xyz" },
      { jsonrpc: "2.0", method: "tools/list", id: 1 }
    );
    expect(res.statusCode).toBe(401);
    expect(res.headers["www-authenticate"]).toContain(
      'resource_metadata="https://mcp.kaminari.ad/.well-known/oauth-protected-resource"'
    );
  });

  it("empty Bearer value → 401 + same WWW-Authenticate", async () => {
    const res = await jsonRpc(
      harness.origin,
      { authorization: "Bearer  " },
      { jsonrpc: "2.0", method: "tools/list", id: 1 }
    );
    expect(res.statusCode).toBe(401);
    expect(res.headers["www-authenticate"]).toContain('scope="mcp:scans:read');
  });
});
