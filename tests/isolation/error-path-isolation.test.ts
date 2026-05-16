/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §10 (error path).
 *
 * If one request's tool handler raises an exception (or returns an
 * `Err`), the response goes ONLY to that request. Concurrent requests
 * for other Bearers must NOT see any of the failing request's state.
 *
 * Asserted via two concurrent `getMe()` calls — one configured to
 * return `Err`, the other a happy-path `Ok`. The Ok caller must
 * receive an untouched Ok result regardless of timing.
 */

import { MockAgent } from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BearerToken } from "../../src/domain/value-objects/bearer-token.js";
import { newRequestId } from "../../src/domain/value-objects/request-id.js";
import { createHttpApiGateway } from "../../src/infrastructure/api/http-api-gateway.js";
import { createFakeLogger } from "../fakes/fake-logger.js";

const ORIGIN = "https://kaminari.test";

describe("isolation: error in one request does not leak into another", () => {
  let agent: MockAgent;

  beforeEach(() => {
    agent = new MockAgent();
    agent.disableNetConnect();
  });
  afterEach(async () => {
    await agent.close();
  });

  it("Bearer A gets Err, Bearer B gets Ok — no cross-talk", async () => {
    // Register the more-specific "happy" intercept FIRST so undici
    // matches it before falling back to the generic 401.
    agent
      .get(ORIGIN)
      .intercept({
        path: "/api/v1/account",
        method: "GET",
        headers: (h) => h["authorization"]?.includes("happy") ?? false,
      })
      .reply(200, {
        id: "00000000-0000-0000-0000-000000000010",
        name: "happy",
        owner_id: "00000000-0000-0000-0000-000000000001",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
      })
      .persist();
    agent
      .get(ORIGIN)
      .intercept({ path: "/api/v1/account", method: "GET" })
      .reply(401, { detail: "Token expired for kad_failing" })
      .persist();

    const failing = createHttpApiGateway({
      baseUrl: ORIGIN,
      bearer: BearerToken.fromString("kad_failing")!,
      requestId: newRequestId(),
      logger: createFakeLogger(),
      dispatcher: agent,
    });
    const happy = createHttpApiGateway({
      baseUrl: ORIGIN,
      bearer: BearerToken.fromString("kad_happy_path_marker")!,
      requestId: newRequestId(),
      logger: createFakeLogger(),
      dispatcher: agent,
    });

    const [failResult, okResult] = await Promise.all([failing.getAccount(), happy.getAccount()]);

    expect(failResult.isErr()).toBe(true);
    expect(okResult.isOk()).toBe(true);
    if (okResult.isOk()) {
      expect(okResult.value.name).toBe("happy");
    }
  });
});
