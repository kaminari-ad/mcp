/**
 * Isolation test: the bare hosted endpoint (`GET /`) redirects to the
 * public landing page. Same data-free, no-auth contract as `/healthz`:
 * no Authorization needed, the header never changes the response, and
 * no outbound API call is made (MockAgent has disableNetConnect).
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { spinUpServer, undiciRequest } from "./_helpers/spin-up-server.js";

const LANDING_URL = "https://kaminari.ad/mcp";

describe("isolation: root redirect to the landing page", () => {
  let harness: Awaited<ReturnType<typeof spinUpServer>>;

  beforeEach(async () => {
    harness = await spinUpServer();
  });
  afterEach(async () => {
    await harness.close();
  });

  it.each(["/", "/?ref=lobehub"])("GET %s returns 301 to the landing page", async (path) => {
    const res = await undiciRequest(`${harness.origin}${path}`);
    expect(res.statusCode).toBe(301);
    expect(res.headers["location"]).toBe(LANDING_URL);
    expect(res.headers["cache-control"]).toBe("public, max-age=3600");
    await res.body.dump();
  });

  it("HEAD / returns the same redirect", async () => {
    const res = await undiciRequest(`${harness.origin}/`, { method: "HEAD" });
    expect(res.statusCode).toBe(301);
    expect(res.headers["location"]).toBe(LANDING_URL);
    await res.body.dump();
  });

  it("ignores Authorization on the redirect", async () => {
    const res = await undiciRequest(`${harness.origin}/`, {
      headers: { authorization: "Bearer sk_live_should_not_matter" },
    });
    expect(res.statusCode).toBe(301);
    expect(res.headers["location"]).toBe(LANDING_URL);
    await res.body.dump();
  });

  it("keeps non-GET methods on / as 404", async () => {
    const res = await undiciRequest(`${harness.origin}/`, { method: "POST" });
    expect(res.statusCode).toBe(404);
    await res.body.dump();
  });

  it("redirects to the configured KAMINARI_AD_MCP_LANDING_URL", async () => {
    const custom = await spinUpServer({ MCP_LANDING_URL: "https://staging.example.test/mcp" });
    try {
      const res = await undiciRequest(`${custom.origin}/`);
      expect(res.statusCode).toBe(301);
      expect(res.headers["location"]).toBe("https://staging.example.test/mcp");
      await res.body.dump();
    } finally {
      await custom.close();
    }
  });

  it("does not redirect other unknown paths", async () => {
    const res = await undiciRequest(`${harness.origin}/admin`);
    expect(res.statusCode).toBe(404);
    await res.body.dump();
  });
});
