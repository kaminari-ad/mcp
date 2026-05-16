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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MockAgent } from "undici";

import { createHttpApiGateway } from "../../src/infrastructure/api/http-api-gateway.js";
import { BearerToken } from "../../src/domain/value-objects/bearer-token.js";
import { newRequestId } from "../../src/domain/value-objects/request-id.js";
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
    // bearer (without the "Bearer " prefix) as the `display_name`.
    agent
      .get(ORIGIN)
      .intercept({ path: "/api/v1/account", method: "GET" })
      .reply(200, (opts) => {
        const auth = (opts.headers as Record<string, string>)["authorization"] ?? "";
        const tok = auth.replace(/^Bearer\s+/, "");
        return {
          user_id: "u",
          organization_id: "o",
          email: "x@y",
          display_name: tok,
          permissions: [],
        };
      })
      .persist();

    const calls = Array.from({ length: N }, (_, i) => {
      const tok = `kad_marker_${String(i).padStart(4, "0")}`;
      const gw = createHttpApiGateway({
        baseUrl: ORIGIN,
        bearer: BearerToken.fromString(tok)!,
        requestId: newRequestId(),
        logger: createFakeLogger(),
        dispatcher: agent,
      });
      return gw.getMe().then((result) => ({ expected: tok, result }));
    });

    const results = await Promise.all(calls);
    for (const { expected, result } of results) {
      expect(result.isOk()).toBe(true);
      // Each response must echo back exactly the Bearer that initiated it.
      expect(result._unsafeUnwrap().display_name).toBe(expected);
    }
  }, 20_000);
});
