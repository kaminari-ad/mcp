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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MockAgent } from "undici";

import { createHttpApiGateway } from "../../src/infrastructure/api/http-api-gateway.js";
import { BearerToken } from "../../src/domain/value-objects/bearer-token.js";
import { newRequestId } from "../../src/domain/value-objects/request-id.js";
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
        headers: (h) =>
          (h as Record<string, string>)["authorization"]?.includes("happy") ?? false,
      })
      .reply(200, {
        user_id: "u",
        organization_id: "o",
        email: "happy@y",
        display_name: "happy",
        permissions: ["scans.read"],
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

    const [failResult, okResult] = await Promise.all([failing.getMe(), happy.getMe()]);

    expect(failResult.isErr()).toBe(true);
    expect(okResult.isOk()).toBe(true);
    if (okResult.isOk()) {
      expect(okResult.value.display_name).toBe("happy");
    }
  });
});
