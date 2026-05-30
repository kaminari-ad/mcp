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

const EXPECTED_CHALLENGE =
  'Bearer resource_metadata="https://mcp.kaminari.ad/.well-known/oauth-protected-resource", scope="mcp:account:read mcp:alert_notifications:read mcp:alert_notifications:write mcp:alerts:read mcp:alerts:write mcp:billing:read mcp:campaigns:read mcp:campaigns:write mcp:custom_rules:read mcp:custom_rules:write mcp:invoicing:read mcp:policies:read mcp:policies:write mcp:scans:read mcp:scans:write mcp:tags:read mcp:tags:write mcp:taxonomies:read mcp:taxonomies:write mcp:webhooks:read mcp:webhooks:write offline_access"';

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
    // Exact-match assertion (not toContain) so any accidental drift
    // in the header — scope reordering, missing param, extra
    // whitespace — fails loudly. Claude's discovery parser is strict.
    expect(res.headers["www-authenticate"]).toBe(EXPECTED_CHALLENGE);
  });

  it("non-Bearer Authorization → 401 + same WWW-Authenticate", async () => {
    const res = await jsonRpc(
      harness.origin,
      { authorization: "Basic xyz" },
      { jsonrpc: "2.0", method: "tools/list", id: 1 }
    );
    expect(res.statusCode).toBe(401);
    expect(res.headers["www-authenticate"]).toBe(EXPECTED_CHALLENGE);
  });

  it("empty Bearer value → 401 + same WWW-Authenticate", async () => {
    const res = await jsonRpc(
      harness.origin,
      { authorization: "Bearer  " },
      { jsonrpc: "2.0", method: "tools/list", id: 1 }
    );
    expect(res.statusCode).toBe(401);
    expect(res.headers["www-authenticate"]).toBe(EXPECTED_CHALLENGE);
  });
});
