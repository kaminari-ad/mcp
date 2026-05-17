/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §9 — outbound
 * 5-key header allowlist (authorization / content-type / accept /
 * user-agent / x-request-id). No other headers reach the upstream
 * API even if the inbound MCP request carried them.
 *
 * The HttpApiGateway adapter copies ONLY `Authorization` (and its own
 * `Content-Type` / `Accept` / `User-Agent` / `X-Request-Id`) to the
 * outbound request. Even if a malicious client tries to inject
 * `X-Org-Id`, `X-User-Id`, `X-Forwarded-User`, or `Cookie`, those
 * headers MUST NOT appear in the request to the Kaminari Ad API.
 */

import { MockAgent } from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BearerToken } from "../../src/domain/value-objects/bearer-token.js";
import { newRequestId } from "../../src/domain/value-objects/request-id.js";
import { createHttpApiGateway } from "../../src/infrastructure/api/http-api-gateway.js";
import { createFakeLogger } from "../fakes/fake-logger.js";

const ORIGIN = "https://kaminari.test";

describe("isolation: header allowlist on outbound API calls", () => {
  let agent: MockAgent;

  beforeEach(() => {
    agent = new MockAgent();
    agent.disableNetConnect();
  });
  afterEach(async () => {
    await agent.close();
  });

  it("only forwards a documented set of headers to the API", async () => {
    let receivedHeaders: Record<string, string> | undefined;
    agent
      .get(ORIGIN)
      .intercept({ path: "/api/v1/account", method: "GET" })
      .reply(200, (opts) => {
        receivedHeaders = opts.headers as Record<string, string>;
        return {
          id: "00000000-0000-0000-0000-000000000010",
          name: "Test Org",
          owner_id: "00000000-0000-0000-0000-000000000001",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
        };
      });

    const gw = createHttpApiGateway({
      baseUrl: ORIGIN,
      bearer: BearerToken.fromString("kad_marker_secret")!,
      requestId: newRequestId(),
      logger: createFakeLogger(),
      dispatcher: agent,
    });
    await gw.getAccount();

    expect(receivedHeaders).toBeDefined();
    if (receivedHeaders === undefined) throw new Error("no headers captured");

    // The only headers that MUST be present.
    expect(receivedHeaders["authorization"]).toBe("Bearer kad_marker_secret");
    expect(receivedHeaders["content-type"]).toBe("application/json");
    expect(receivedHeaders["accept"]).toBe("application/json");
    expect(receivedHeaders["user-agent"]).toBe("kaminari-ad-mcp");
    expect(typeof receivedHeaders["x-request-id"]).toBe("string");

    // Headers a malicious client (or misconfigured nginx) might try
    // to inject MUST NOT appear.
    expect(receivedHeaders["x-org-id"]).toBeUndefined();
    expect(receivedHeaders["x-user-id"]).toBeUndefined();
    expect(receivedHeaders["x-forwarded-user"]).toBeUndefined();
    expect(receivedHeaders["x-real-ip"]).toBeUndefined();
    expect(receivedHeaders["cookie"]).toBeUndefined();
    expect(receivedHeaders["cookie2"]).toBeUndefined();
    expect(receivedHeaders["x-api-key"]).toBeUndefined();
  });
});
