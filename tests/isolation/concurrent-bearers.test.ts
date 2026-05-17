/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §10.
 *
 * Many concurrent tool calls with distinct Bearers MUST receive their
 * own response — never another tenant's. We assert this by:
 *
 *   1. Spinning up the real HTTP request handler.
 *   2. Constructing N `HttpApiGateway` instances in parallel (mimicking
 *      what happens per-request inside the handler), each with a
 *      distinct Bearer.
 *   3. The MockAgent is configured so the API echoes the Bearer's
 *      marker back in the response, so we can verify zero cross-talk.
 *
 * This focuses on the in-process per-request scoping. The full-stack
 * concurrent-bearers test (with a real http.Server + many parallel
 * `undici.request` calls) is in `concurrent-bearers-http.test.ts`
 * when Phase 6 deploy is ready; for now this covers the same
 * invariant at the closure-scoping level.
 */

import { MockAgent } from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BearerToken } from "../../src/domain/value-objects/bearer-token.js";
import { newRequestId } from "../../src/domain/value-objects/request-id.js";
import { createHttpApiGateway } from "../../src/infrastructure/api/http-api-gateway.js";
import { createFakeLogger } from "../fakes/fake-logger.js";

const ORIGIN = "https://kaminari.test";

describe("isolation: concurrent bearers — zero cross-talk", () => {
  let agent: MockAgent;

  beforeEach(() => {
    agent = new MockAgent();
    agent.disableNetConnect();
  });
  afterEach(async () => {
    await agent.close();
  });

  it("100 concurrent gateways, 100 distinct Bearers, each gets its own response", async () => {
    const N = 100;

    // Persistent handler: read the Authorization header, echo back the
    // bearer (without the "Bearer " prefix) as the org `name`.
    agent
      .get(ORIGIN)
      .intercept({ path: "/api/v1/account", method: "GET" })
      .reply(200, (opts) => {
        const auth = (opts.headers as Record<string, string>)["authorization"] ?? "";
        const tok = auth.replace(/^Bearer\s+/, "");
        return {
          id: "00000000-0000-0000-0000-000000000010",
          name: tok,
          owner_id: "00000000-0000-0000-0000-000000000001",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
        };
      })
      .persist();

    const calls = Array.from({ length: N }, async (_, i) => {
      const tok = `kad_marker_${String(i).padStart(4, "0")}`;
      const gw = createHttpApiGateway({
        baseUrl: ORIGIN,
        bearer: BearerToken.fromString(tok)!,
        requestId: newRequestId(),
        logger: createFakeLogger(),
        dispatcher: agent,
      });
      return gw.getAccount().then((result) => ({ expected: tok, result }));
    });

    const results = await Promise.all(calls);
    for (const { expected, result } of results) {
      expect(result.isOk()).toBe(true);
      // Each response must echo back exactly the Bearer that initiated it.
      expect(result._unsafeUnwrap().name).toBe(expected);
    }
  }, 20_000);
});
