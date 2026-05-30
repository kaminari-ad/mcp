/**
 * Isolation test: RFC 9728 protected-resource metadata discovery.
 *
 * Pattern mirrors `missing-auth.test.ts` — the well-known endpoint
 * MUST be:
 *
 *   1. Callable without `Authorization` (tenant-isolation rule §16-style
 *      "data-free, no-auth" surface; same shape as `/healthz`).
 *   2. Body byte-stable so a refactor cannot silently change what
 *      Anthropic's Claude client discovers — that breaks every existing
 *      directory connection.
 *   3. Never triggers an outbound API call (MockAgent records zero
 *      traffic).
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { spinUpServer, undiciRequest } from "./_helpers/spin-up-server.js";

describe("isolation: OAuth protected-resource metadata discovery", () => {
  let harness: Awaited<ReturnType<typeof spinUpServer>>;

  beforeEach(async () => {
    harness = await spinUpServer();
  });
  afterEach(async () => {
    await harness.close();
  });

  it("GET /.well-known/oauth-protected-resource returns 200 + RFC 9728 JSON without auth", async () => {
    // No `intercept` registered → if MCP tried to call the API, undici
    // would reject (MockAgent has disableNetConnect).
    const res = await undiciRequest(`${harness.origin}/.well-known/oauth-protected-resource`);
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/json");

    const body = (await res.body.json()) as Readonly<Record<string, unknown>>;
    // Golden shape — locked so a regression here surfaces immediately
    // rather than as a silent Claude-side discovery failure.
    expect(body).toEqual({
      resource: "https://mcp.kaminari.ad/mcp",
      authorization_servers: ["https://app.kaminari.ad"],
      scopes_supported: [
        "mcp:account:read",
        "mcp:alert_notifications:read",
        "mcp:alert_notifications:write",
        "mcp:alerts:read",
        "mcp:alerts:write",
        "mcp:billing:read",
        "mcp:campaigns:read",
        "mcp:campaigns:write",
        "mcp:custom_rules:read",
        "mcp:custom_rules:write",
        "mcp:invoicing:read",
        "mcp:policies:read",
        "mcp:policies:write",
        "mcp:scans:read",
        "mcp:scans:write",
        "mcp:tags:read",
        "mcp:tags:write",
        "mcp:taxonomies:read",
        "mcp:taxonomies:write",
        "mcp:webhooks:read",
        "mcp:webhooks:write",
        "offline_access",
      ],
      bearer_methods_supported: ["header"],
    });
  });

  it("sets a sensible Cache-Control so CDNs/edges don't hammer the endpoint", async () => {
    const res = await undiciRequest(`${harness.origin}/.well-known/oauth-protected-resource`);
    expect(res.statusCode).toBe(200);
    // Public + 1 hour TTL — short enough that a scope-catalogue
    // change propagates fast, long enough to absorb directory traffic.
    expect(res.headers["cache-control"]).toBe("public, max-age=3600");
  });

  it("ignores Authorization header on the discovery endpoint (still 200)", async () => {
    const res = await undiciRequest(`${harness.origin}/.well-known/oauth-protected-resource`, {
      headers: { authorization: "Bearer whatever" },
    });
    expect(res.statusCode).toBe(200);
  });

  it("POST /.well-known/oauth-protected-resource is 404 (only GET advertised)", async () => {
    const res = await undiciRequest(`${harness.origin}/.well-known/oauth-protected-resource`, {
      method: "POST",
    });
    expect(res.statusCode).toBe(404);
  });

  it("does not leak the request through pino's bearer-redaction layer", async () => {
    await undiciRequest(`${harness.origin}/.well-known/oauth-protected-resource`);
    // The endpoint should not produce any tenant-flavoured log lines —
    // tests/isolation/token-in-logs.test.ts covers the converse for
    // /mcp. Here we only assert the request does not crash log
    // redaction.
    expect(harness.logs()).not.toContain("[BearerToken redacted]");
  });
});
