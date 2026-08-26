import { MockAgent } from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BearerToken } from "../../../../src/domain/value-objects/bearer-token.js";
import { newRequestId } from "../../../../src/domain/value-objects/request-id.js";
import { createHttpApiGateway } from "../../../../src/infrastructure/api/http-api-gateway.js";
import { createFakeLogger } from "../../../fakes/fake-logger.js";

const ORIGIN = "https://kaminari.test";

function buildGateway(agent: MockAgent) {
  return createHttpApiGateway({
    baseUrl: ORIGIN,
    bearer: BearerToken.fromString("kad_test_token_value")!,
    requestId: newRequestId(),
    logger: createFakeLogger(),
    dispatcher: agent,
  });
}

describe("HttpApiGateway", () => {
  let agent: MockAgent;

  beforeEach(() => {
    agent = new MockAgent();
    agent.disableNetConnect();
  });

  afterEach(async () => {
    await agent.close();
  });

  describe("getAccount", () => {
    const ORG = {
      id: "00000000-0000-0000-0000-000000000010",
      name: "Test Org",
      owner_id: "00000000-0000-0000-0000-000000000001",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    };

    it("returns Ok on 200", async () => {
      agent.get(ORIGIN).intercept({ path: "/api/v1/account", method: "GET" }).reply(200, ORG);

      const gw = buildGateway(agent);
      const result = await gw.getAccount();
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(ORG);
    });

    it("forwards the Authorization header verbatim", async () => {
      let received: string | undefined;
      agent
        .get(ORIGIN)
        .intercept({
          path: "/api/v1/account",
          method: "GET",
        })
        .reply(200, (opts) => {
          received = (opts.headers as Record<string, string> | undefined)?.["authorization"];
          return ORG;
        });

      await buildGateway(agent).getAccount();
      expect(received).toBe("Bearer kad_test_token_value");
    });

    it("maps 401 to unauthorized", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(401, { detail: "Not authenticated" });

      const result = await buildGateway(agent).getAccount();
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        kind: "unauthorized",
        detail: "Not authenticated",
      });
    });

    it("maps 403 with code", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(403, { detail: "Suspended", code: "billing.suspended" });

      const err = (await buildGateway(agent).getAccount())._unsafeUnwrapErr();
      expect(err).toEqual({
        kind: "forbidden",
        detail: "Suspended",
        code: "billing.suspended",
      });
    });

    it("maps 404", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(404, { detail: "x" });
      expect((await buildGateway(agent).getAccount())._unsafeUnwrapErr()).toEqual({
        kind: "not-found",
        detail: "x",
      });
    });

    it("maps 422 to invalid-input", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(422, { detail: "bad" });
      expect((await buildGateway(agent).getAccount())._unsafeUnwrapErr()).toMatchObject({
        kind: "invalid-input",
        detail: "bad",
      });
    });

    it("maps 429 with Retry-After header", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(429, { detail: "Slow down" }, { headers: { "retry-after": "30" } });
      const err = (await buildGateway(agent).getAccount())._unsafeUnwrapErr();
      expect(err).toEqual({
        kind: "rate-limited",
        detail: "Slow down",
        retryAfterMs: 30_000,
      });
    });

    it("maps 5xx to upstream with status", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(503, { detail: "down" });
      expect((await buildGateway(agent).getAccount())._unsafeUnwrapErr()).toEqual({
        kind: "upstream",
        detail: "down",
        status: 503,
      });
    });

    it("returns upstream when the 200 body has the wrong shape", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(200, { unexpected: "shape" });
      const result = await buildGateway(agent).getAccount();
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toMatchObject({ kind: "upstream" });
    });

    it("returns upstream when the 200 body is a plain string", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(200, "just a string");
      const result = await buildGateway(agent).getAccount();
      expect(result.isErr()).toBe(true);
    });

    it("falls back to a generic detail when the error body is missing", async () => {
      agent.get(ORIGIN).intercept({ path: "/api/v1/account", method: "GET" }).reply(401, {});
      const err = (await buildGateway(agent).getAccount())._unsafeUnwrapErr();
      expect(err).toEqual({ kind: "unauthorized", detail: "Upstream error" });
    });

    it("forbidden without a code drops the code field", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(403, { detail: "no" });
      expect((await buildGateway(agent).getAccount())._unsafeUnwrapErr()).toEqual({
        kind: "forbidden",
        detail: "no",
      });
    });

    it("429 without a Retry-After header omits retryAfterMs", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(429, { detail: "slow" });
      expect((await buildGateway(agent).getAccount())._unsafeUnwrapErr()).toEqual({
        kind: "rate-limited",
        detail: "slow",
      });
    });

    it("400 maps to invalid-input", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .reply(400, { detail: "bad request" });
      expect((await buildGateway(agent).getAccount())._unsafeUnwrapErr()).toMatchObject({
        kind: "invalid-input",
        detail: "bad request",
      });
    });

    it("network failure (replyWithError) maps to upstream", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account", method: "GET" })
        .replyWithError(new Error("ECONNRESET"));
      const result = await buildGateway(agent).getAccount();
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toEqual({
        kind: "upstream",
        detail: "ECONNRESET",
      });
    });
  });

  describe("listScans", () => {
    it("sends pagination + filter query params and parses the envelope", async () => {
      let receivedPath: string | undefined;
      agent
        .get(ORIGIN)
        .intercept({
          path: (p) => {
            receivedPath = p;
            return p.startsWith("/api/v1/scans?");
          },
          method: "GET",
        })
        .reply(200, {
          items: [
            {
              id: "00000000-0000-0000-0000-000000000aaa",
              url: "https://ad.example/a",
              country_code: "US",
              status: "completed",
              offer_url: "https://offer.example",
              elapsed_ms: 1234,
              labels: {},
              campaign_id: null,
              campaign_name: null,
              created_at: "2026-05-16T12:00:00Z",
            },
          ],
          total: 1,
          page: 2,
          limit: 10,
        });

      const result = await buildGateway(agent).listScans({
        page: 2,
        limit: 10,
        status: "completed",
        country_code: "US",
      });
      expect(result.isOk()).toBe(true);
      const items = result._unsafeUnwrap().items;
      expect(items).toHaveLength(1);
      expect(items[0]?.id).toBe("00000000-0000-0000-0000-000000000aaa");
      expect(items[0]?.country_code).toBe("US");
      expect(result._unsafeUnwrap().total).toBe(1);
      expect(receivedPath).toContain("page=2");
      expect(receivedPath).toContain("limit=10");
      expect(receivedPath).toContain("status=completed");
      expect(receivedPath).toContain("country_code=US");
    });

    it("returns upstream on malformed envelope", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/scans"), method: "GET" })
        .reply(200, { wrong: "shape" });
      const result = await buildGateway(agent).listScans({ page: 1, limit: 50 });
      expect(result.isErr()).toBe(true);
    });

    it("omits undefined optional filters from the query string (covers buildQuery `continue`)", async () => {
      let receivedPath = "";
      agent
        .get(ORIGIN)
        .intercept({
          path: (p) => {
            receivedPath = p;
            return p.startsWith("/api/v1/scans");
          },
          method: "GET",
        })
        .reply(200, { items: [], total: 0, page: 1, limit: 50 });

      // Construct an object with explicitly-undefined optional fields
      // via `Object.assign` to keep `exactOptionalPropertyTypes` happy
      // (the type only allows absence; the runtime check still has to
      // tolerate `undefined` from JSON.parse outputs / dynamic input).
      const filters = Object.assign(
        { page: 1, limit: 50 },
        {
          status: undefined,
          country_code: undefined,
        }
      ) as unknown as Parameters<ReturnType<typeof buildGateway>["listScans"]>[0];

      await buildGateway(agent).listScans(filters);

      expect(receivedPath).not.toContain("status=");
      expect(receivedPath).not.toContain("country_code=");
    });

    it("returns upstream on malformed scan item", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/scans"), method: "GET" })
        .reply(200, { items: [{ id: 42 }], total: 1, page: 1, limit: 50 });
      const result = await buildGateway(agent).listScans({ page: 1, limit: 50 });
      expect(result.isErr()).toBe(true);
    });

    it("returns upstream when items is not an array", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/scans"), method: "GET" })
        .reply(200, "string body");
      const result = await buildGateway(agent).listScans({ page: 1, limit: 50 });
      expect(result.isErr()).toBe(true);
    });

    it("treats string-typed item field as malformed", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/scans"), method: "GET" })
        .reply(200, {
          items: ["not-an-object"],
          total: 1,
          page: 1,
          limit: 50,
        });
      expect((await buildGateway(agent).listScans({ page: 1, limit: 50 })).isErr()).toBe(true);
    });
  });

  describe("getScan", () => {
    it("returns Ok on 200 with valid body", async () => {
      agent
        .get(ORIGIN)
        .intercept({
          path: "/api/v1/scans/00000000-0000-0000-0000-000000000aaa",
          method: "GET",
        })
        .reply(200, {
          id: "00000000-0000-0000-0000-000000000aaa",
          url: "https://x",
          country_code: "US",
          emulator_id: "default",
          status: "completed",
          offer_url: "https://o",
          screenshot_url: "",
          page_title: "T",
          elapsed_ms: 100,
          error: "",
          labels: {},
          campaign_id: null,
          created_at: "2026-01-01T00:00:00Z",
          completed_at: null,
        });
      const result = await buildGateway(agent).getScan("00000000-0000-0000-0000-000000000aaa");
      expect(result.isOk()).toBe(true);
    });

    it("maps 404 to not-found", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/scans/missing", method: "GET" })
        .reply(404, { detail: "Scan not found" });
      const result = await buildGateway(agent).getScan("missing");
      expect(result._unsafeUnwrapErr().kind).toBe("not-found");
    });
  });

  describe("listScanChildren", () => {
    it("GETs the children path with pagination and parses the envelope", async () => {
      let receivedPath: string | undefined;
      agent
        .get(ORIGIN)
        .intercept({
          path: (p) => {
            receivedPath = p;
            return p.startsWith("/api/v1/scans/00000000-0000-0000-0000-000000000aaa/children?");
          },
          method: "GET",
        })
        .reply(200, { items: [], total: 0, page: 1, limit: 50 });
      const result = await buildGateway(agent).listScanChildren(
        "00000000-0000-0000-0000-000000000aaa",
        { page: 1, limit: 50 }
      );
      expect(result.isOk()).toBe(true);
      expect(receivedPath).toContain("page=1");
      expect(receivedPath).toContain("limit=50");
    });
  });

  describe("createScan", () => {
    it("POSTs body and returns the parsed scan on 201", async () => {
      let receivedBody: unknown;
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/scans", method: "POST" })
        .reply(201, (opts) => {
          receivedBody = JSON.parse(String(opts.body));
          return {
            id: "00000000-0000-0000-0000-000000000bbb",
            url: "https://x",
            country_code: "US",
            emulator_id: "default",
            status: "pending",
            offer_url: "",
            screenshot_url: "",
            page_title: "",
            elapsed_ms: 0,
            error: "",
            labels: {},
            campaign_id: null,
            created_at: "2026-01-01T00:00:00Z",
            completed_at: null,
          };
        });
      const result = await buildGateway(agent).createScan({
        url: "https://x",
        country_code: "US",
        emulator_id: "default",
      });
      expect(result.isOk()).toBe(true);
      expect(receivedBody).toEqual({
        url: "https://x",
        country_code: "US",
        emulator_id: "default",
      });
    });
  });

  describe("createBulkScans", () => {
    it("POSTs and returns the array", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/scans/bulk", method: "POST" })
        .reply(201, [
          {
            id: "00000000-0000-0000-0000-000000000ccc",
            url: "https://x",
            country_code: "US",
            emulator_id: "default",
            status: "pending",
            offer_url: "",
            screenshot_url: "",
            page_title: "",
            elapsed_ms: 0,
            error: "",
            labels: {},
            campaign_id: null,
            created_at: "2026-01-01T00:00:00Z",
            completed_at: null,
          },
        ]);
      const result = await buildGateway(agent).createBulkScans({
        url: "https://x",
        country_codes: ["US"],
        emulator_id: "default",
      });
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toHaveLength(1);
    });
  });

  describe("recheckScans", () => {
    it("returns queued_count", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/scans/recheck", method: "POST" })
        .reply(200, { queued_count: 10 });
      const result = await buildGateway(agent).recheckScans({
        scope_type: "hours",
        scope_value: 4,
      });
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ queued_count: 10 });
    });
  });

  describe("cancelScan", () => {
    it("returns cancelled_count", async () => {
      agent
        .get(ORIGIN)
        .intercept({
          path: "/api/v1/scans/00000000-0000-0000-0000-000000000aaa/cancel",
          method: "POST",
        })
        .reply(200, { cancelled_count: 1 });
      const result = await buildGateway(agent).cancelScan("00000000-0000-0000-0000-000000000aaa");
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ cancelled_count: 1 });
    });
  });

  describe("listGeos", () => {
    it("returns the parsed array on 200", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/geos", method: "GET" })
        .reply(200, [
          { country_code: "US", name: "United States", region: "Americas", tier: "tier-1" },
        ]);
      const result = await buildGateway(agent).listGeos();
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toHaveLength(1);
    });

    it("returns upstream when the body is not an array", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/geos", method: "GET" })
        .reply(200, { not: "array" });
      expect((await buildGateway(agent).listGeos()).isErr()).toBe(true);
    });

    it("returns upstream when a geo item has wrong field types", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/geos", method: "GET" })
        .reply(200, [{ code: 1, name: 2, continent: 3, emoji: 4 }]);
      expect((await buildGateway(agent).listGeos()).isErr()).toBe(true);
    });

    it("returns upstream when a geo item is not an object", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/geos", method: "GET" })
        .reply(200, ["just-a-string"]);
      expect((await buildGateway(agent).listGeos()).isErr()).toBe(true);
    });
  });

  describe("getProxyTargeting", () => {
    const CATALOGUE = {
      country_code: "US",
      proxy_type: "mobile",
      regions: ["California"],
      cities: ["Los Angeles"],
      isps: ["Verizon"],
      refreshed_at: "2026-08-26T00:00:00Z",
      ttl_seconds: 3600,
    };

    it("forwards every filter as a query param and parses the catalogue", async () => {
      agent
        .get(ORIGIN)
        .intercept({
          path: "/api/v1/proxy/targeting?country_code=US&proxy_type=mobile&region=California",
          method: "GET",
        })
        .reply(200, CATALOGUE);
      const result = await buildGateway(agent).getProxyTargeting({
        country_code: "US",
        proxy_type: "mobile",
        region: "California",
      });
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().isps).toEqual(["Verizon"]);
    });

    it("returns upstream when the body is the wrong shape", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/proxy/targeting?country_code=US", method: "GET" })
        .reply(200, { country_code: "US" });
      expect((await buildGateway(agent).getProxyTargeting({ country_code: "US" })).isErr()).toBe(
        true
      );
    });
  });

  describe("unpublishPolicySet", () => {
    const PID = "00000000-0000-0000-0000-000000000eee";

    it("returns null on 204", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/policy-sets/${PID}/unpublish`, method: "POST" })
        .reply(204, "");
      const result = await buildGateway(agent).unpublishPolicySet(PID);
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeNull();
    });

    it("maps a 404 to an error", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/policy-sets/${PID}/unpublish`, method: "POST" })
        .reply(404, { detail: "not found" });
      expect((await buildGateway(agent).unpublishPolicySet(PID)).isErr()).toBe(true);
    });
  });

  describe("campaigns / runs / groups (smoke)", () => {
    const CAMPAIGN = {
      id: "00000000-0000-0000-0000-000000000ccc",
      name: "X",
      campaign_type: "url",
      url: "https://x.com",
      ad_tag: null,
      country_codes: ["US"],
      group_id: "00000000-0000-0000-0000-000000000111",
      emulator_selection: { categories: ["android_phone"], specific_ids: [], mode: "random" },
      labels: {},
      policy_set_id: null,
      schedule_enabled: false,
      is_archived: false,
      created_at: "2026-01-01T00:00:00Z",
      last_run_at: null,
    };
    const GROUP = {
      id: "00000000-0000-0000-0000-000000000111",
      name: "default",
      is_default: true,
      is_archived: false,
      schedule_paused: false,
      created_at: "2026-01-01T00:00:00Z",
      campaign_count: 0,
    };
    const RUN = {
      id: "00000000-0000-0000-0000-000000000222",
      campaign_id: CAMPAIGN.id,
      label: "r",
      total: 1,
      completed: 1,
      failed: 0,
      partial: 0,
      cancelled: 0,
      source: "api",
      created_at: "2026-01-01T00:00:00Z",
    };

    it("listCampaigns / getCampaign / createCampaign / updateCampaign / archiveCampaign", async () => {
      const a = agent;
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/campaigns?"), method: "GET" })
        .reply(200, { items: [CAMPAIGN], total: 1, page: 1, limit: 50 });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaigns/${CAMPAIGN.id}`, method: "GET" })
        .reply(200, CAMPAIGN);
      a.get(ORIGIN).intercept({ path: "/api/v1/campaigns", method: "POST" }).reply(201, CAMPAIGN);
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaigns/${CAMPAIGN.id}`, method: "PATCH" })
        .reply(200, CAMPAIGN);
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaigns/${CAMPAIGN.id}/archive`, method: "POST" })
        .reply(200, { ...CAMPAIGN, is_archived: true });

      const gw = buildGateway(agent);
      expect((await gw.listCampaigns({ page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.getCampaign(CAMPAIGN.id)).isOk()).toBe(true);
      expect(
        (
          await gw.createCampaign({
            name: "X",
            campaign_type: "url",
            url: "https://x.com",
            country_codes: ["US"],
          })
        ).isOk()
      ).toBe(true);
      expect((await gw.updateCampaign(CAMPAIGN.id, { name: "Y" })).isOk()).toBe(true);
      const arch = await gw.archiveCampaign(CAMPAIGN.id);
      expect(arch.isOk()).toBe(true);
      expect(arch._unsafeUnwrap().is_archived).toBe(true);
    });

    it("getRun", async () => {
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/runs/${RUN.id}`, method: "GET" })
        .reply(200, RUN);

      const gw = buildGateway(agent);
      expect((await gw.getRun(RUN.id)).isOk()).toBe(true);
    });

    it("emulators / tags / custom-rules / policy-sets / alerts / webhooks / billing / api-keys", async () => {
      const TAG = {
        slug: "x",
        category: "c",
        source: "system",
        display_name: "X",
        description: "",
        scope: "system",
        organization_id: null,
        visibility: "internal",
        severity: "high",
        scans_count: 0,
        rules_count: 0,
      };
      const RULE = {
        id: "00000000-0000-0000-0000-000000000bbb",
        organization_id: "00000000-0000-0000-0000-000000000010",
        name: "R",
        tag_slug: "ml.spam",
        rule_type: "regex",
        config: { pattern: "x" },
        target: "page",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
      };
      const POLICY = {
        id: "00000000-0000-0000-0000-000000000eee",
        organization_id: "00000000-0000-0000-0000-000000000010",
        name: "ps",
        description: "",
        visibility: "private",
        is_approved: true,
        entries: [],
        created_at: "2026-01-01T00:00:00Z",
      };
      const ALERT = {
        id: "00000000-0000-0000-0000-000000000aaa",
        scan_id: "00000000-0000-0000-0000-000000000bbb",
        campaign_id: "00000000-0000-0000-0000-000000000ccc",
        policy_set_id: null,
        violation_rule_id: null,
        tag_slug: "x",
        tag_display_name: "X",
        country_code: "US",
        status: "open",
        closed_by: null,
        scan_url: "https://x",
        offer_url: "https://o",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };
      const WH = {
        id: "00000000-0000-0000-0000-000000000eee",
        url: "https://x/wh",
        description: "",
        event_types: ["scan.done"],
        campaign_ids: [],
        is_active: true,
        disabled_reason: null,
        disabled_at: null,
        health: {
          consecutive_failures: 0,
          last_delivery_at: null,
          last_delivery_status: null,
          success_rate_7d: 1,
          failing_since: null,
          paused_until: null,
        },
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };
      const API_KEY = {
        id: "00000000-0000-0000-0000-000000000fff",
        key_prefix: "kad_abc1",
        name: "ci",
        expires_at: null,
        created_at: "2026-01-01T00:00:00Z",
      };

      const a = agent;
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/emulators", method: "GET" })
        .reply(200, [{ id: "default", display_name: "D", category: "desktop", browser: "chrome" }]);
      a.get(ORIGIN).intercept({ path: "/api/v1/tag-definitions", method: "GET" }).reply(200, [TAG]);
      // `/custom-rules` and `/policy-sets` both return the standard
      // FastAPI paginated envelope (since v0.2.0 the MCP surfaces
      // `total` / `page` / `limit` instead of dropping them).
      // `/campaigns/picker` returns a bare slim array (no envelope) —
      // intentionally not paginated, used by selection UIs.
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/campaigns/picker", method: "GET" })
        .reply(200, [
          {
            id: "00000000-0000-0000-0000-000000000ccc",
            name: "picker-camp",
            group_id: "00000000-0000-0000-0000-000000000111",
            is_archived: false,
          },
        ]);
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/custom-rules?"), method: "GET" })
        .reply(200, { items: [RULE], total: 1, page: 1, limit: 50, pages: 1 });
      a.get(ORIGIN).intercept({ path: "/api/v1/custom-rules", method: "POST" }).reply(201, RULE);
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/custom-rules/${RULE.id}`, method: "DELETE" })
        .reply(204, "");
      // `GET /policy-sets` returns the SLIM `PolicySetListItem` per row
      // (no `entries` — those load on demand via `getPolicySet`). The
      // parser strips `entries` if accidentally present, but the smoke
      // fixture mirrors real prod shape so the assertion exercises the
      // same wire format agents see.
      const { entries: _omit, ...POLICY_LIST_ROW } = POLICY;
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/policy-sets?"), method: "GET" })
        .reply(200, { items: [POLICY_LIST_ROW], total: 1, page: 1, limit: 50, pages: 1 });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/policy-sets/${POLICY.id}`, method: "GET" })
        .reply(200, POLICY);
      a.get(ORIGIN).intercept({ path: "/api/v1/policy-sets", method: "POST" }).reply(201, POLICY);
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/alerts?"), method: "GET" })
        .reply(200, { items: [ALERT], total: 1, page: 1, limit: 50 });
      a.get(ORIGIN).intercept({ path: "/api/v1/webhooks", method: "GET" }).reply(200, [WH]);
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/webhooks", method: "POST" })
        .reply(201, { webhook: WH, secret: "whsec_x" });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/webhooks/${WH.id}`, method: "DELETE" })
        .reply(204, "");
      a.get(ORIGIN).intercept({ path: "/api/v1/billing", method: "GET" }).reply(200, {
        balance_micros: 100,
        plan_id: null,
        plan_name: null,
        checks_per_period: null,
        checks_used: null,
        period_start: null,
        period_end: null,
        price_per_extra_check_micros: null,
        is_suspended: false,
        can_create_scan: true,
        billing_mode: "prepaid",
        block_reason: null,
      });
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/account/api-keys", method: "GET" })
        .reply(200, [API_KEY]);

      const gw = buildGateway(agent);
      expect((await gw.listEmulators()).isOk()).toBe(true);
      expect((await gw.listTags()).isOk()).toBe(true);
      expect((await gw.listCustomRules({ page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.listCampaignsPicker()).isOk()).toBe(true);
      expect(
        (
          await gw.createCustomRule({
            name: "R",
            rule_type: "regex",
            config: { pattern: "x" },
          })
        ).isOk()
      ).toBe(true);
      expect((await gw.deleteCustomRule(RULE.id)).isOk()).toBe(true);
      expect((await gw.listPolicySets({ page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.getPolicySet(POLICY.id)).isOk()).toBe(true);
      expect(
        (
          await gw.createPolicySet({
            name: "x",
            description: "d",
            entries: [
              {
                rule_type: "tag",
                tag_slug: "y",
                iab_v3: null,
                brand: null,
                ai_category: null,
                custom_taxonomy: null,
                country_codes: [],
              },
            ],
          })
        ).isOk()
      ).toBe(true);
      expect((await gw.listAlerts({ page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.listWebhooks()).isOk()).toBe(true);
      expect(
        (
          await gw.createWebhook({
            url: "https://x/wh",
            description: "",
            event_types: ["scan.done"],
            campaign_ids: [],
          })
        ).isOk()
      ).toBe(true);
      expect((await gw.deleteWebhook(WH.id)).isOk()).toBe(true);
      expect((await gw.getBillingSummary()).isOk()).toBe(true);
      expect((await gw.listApiKeys()).isOk()).toBe(true);
    });

    it("all v1 extensions (account + lifecycle + billing + invoicing + alert-notifications + webhooks-extras + tag-CRUD + custom-rule extras + policy extras + run extras)", async () => {
      const CID = "00000000-0000-0000-0000-000000000ccc";
      const GID = "00000000-0000-0000-0000-000000000111";
      const RID = "00000000-0000-0000-0000-000000000222";
      const UID = "00000000-0000-0000-0000-000000000001";
      const KID = "00000000-0000-0000-0000-000000000fff";
      const WID = "00000000-0000-0000-0000-000000000eee";
      const AID = "00000000-0000-0000-0000-000000000aaa";
      const PID = "00000000-0000-0000-0000-000000000ddd";
      const TR = "00000000-0000-0000-0000-000000000bbb";
      const DID = "00000000-0000-0000-0000-000000000789";
      const a = agent;
      // ── account ────────────────────────────────────────────
      a.get(ORIGIN).intercept({ path: "/api/v1/account", method: "PATCH" }).reply(200, {
        id: "00000000-0000-0000-0000-000000000010",
        name: "X",
        owner_id: UID,
        is_active: true,
        created_at: "2026-05-17T00:00:00Z",
      });
      a.get(ORIGIN).intercept({ path: "/api/v1/account/users", method: "GET" }).reply(200, []);
      a.get(ORIGIN).intercept({ path: "/api/v1/account/users/invite", method: "POST" }).reply(201, {
        id: UID,
        email: "inv@example.com",
        name: "Inv",
        role_id: UID,
        role_name: "viewer",
        is_active: true,
        created_at: "2026-05-17T00:00:00Z",
      });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/account/users/${UID}/role`, method: "PATCH" })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/account/users/${UID}`, method: "DELETE" })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/account/users/${UID}/transfer-ownership`, method: "POST" })
        .reply(204, "");
      a.get(ORIGIN).intercept({ path: "/api/v1/account/roles", method: "GET" }).reply(200, []);
      a.get(ORIGIN).intercept({ path: "/api/v1/account/api-keys", method: "POST" }).reply(201, {
        id: KID,
        full_key: "secret",
        key_prefix: "p",
        name: "n",
        expires_at: null,
        created_at: "2026-05-17T00:00:00Z",
      });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/account/api-keys/${KID}`, method: "DELETE" })
        .reply(204, "");
      // ── scans / runs / tags ────────────────────────────────
      // `/runs/{run_id}/scans` returns the slim `ScanTileResponse` per
      // item — NOT the full `ScanBriefResponse` (no input `url`, no
      // labels, no campaign linkage). Driven by `parseRunScanPage`.
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith(`/api/v1/runs/${RID}/scans?`), method: "GET" })
        .reply(200, {
          items: [
            {
              id: "00000000-0000-0000-0000-000000000bbb",
              country_code: "US",
              status: "completed",
              offer_url: "https://o.example",
              screenshot_url: "",
              elapsed_ms: 1234,
              error: "",
            },
          ],
          total: 1,
          page: 1,
          limit: 50,
          pages: 1,
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${AID}/tags`, method: "GET" })
        .reply(200, []);
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/tag-definitions/malware", method: "GET" })
        .reply(200, {
          slug: "malware",
          category: "security",
          source: "system",
          display_name: "Malware",
          description: "",
          severity: "high",
          scope: "system",
          organization_id: null,
          visibility: "public",
          // Detail endpoint includes `linked_rules` (custom rules
          // currently producing this tag). The MCP `getTagDefinition`
          // surfaces them in the tool output since v0.2.0.
          linked_rules: [
            { id: "00000000-0000-0000-0000-000000000abc", name: "ad-detector", is_active: true },
          ],
          scans_count: 0,
          rules_count: 0,
        });
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/tag-definitions/malware", method: "PATCH" })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/tag-definitions/malware", method: "DELETE" })
        .reply(204, "");
      // ── custom rules ───────────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/custom-rules/${TR}`, method: "GET" })
        .reply(200, {
          id: TR,
          organization_id: "00000000-0000-0000-0000-000000000010",
          name: "r",
          tag_slug: "x",
          rule_type: "regex",
          config: {},
          target: "page",
          is_active: true,
          created_at: "2026-05-17T00:00:00Z",
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/custom-rules/${TR}`, method: "PUT" })
        .reply(200, {
          id: TR,
          organization_id: "00000000-0000-0000-0000-000000000010",
          name: "r",
          tag_slug: "x",
          rule_type: "regex",
          config: {},
          target: "page",
          is_active: true,
          created_at: "2026-05-17T00:00:00Z",
        });
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/custom-rules/test", method: "POST" })
        .reply(200, { matched: true, elapsed_ms: 1, tags: [] });
      // ── policy sets ────────────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/policy-sets/${PID}`, method: "PUT" })
        .reply(200, {
          id: PID,
          organization_id: "00000000-0000-0000-0000-000000000010",
          name: "x",
          description: "",
          visibility: "private",
          is_approved: false,
          entries: [],
          created_at: "2026-05-17T00:00:00Z",
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/policy-sets/${PID}`, method: "DELETE" })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/policy-sets/${PID}/request-approval`, method: "POST" })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({
          path: `/api/v1/policy-sets/${PID}/campaigns?page=1&limit=50`,
          method: "GET",
        })
        .reply(200, { items: [], total: 0, page: 1, limit: 50, pages: 0 });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/policy-sets/${PID}/campaigns/attach`, method: "POST" })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/policy-sets/${PID}/campaigns/detach`, method: "POST" })
        .reply(204, "");
      // ── alerts ─────────────────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/alerts/${AID}/status`, method: "PATCH" })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/alerts/bulk-status", method: "POST" })
        .reply(200, { updated: 1, skipped: 0 });
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/alerts/stats", method: "GET" })
        .reply(200, { open: 0, escalated: 0, resolved: 0, dismissed: 0 });
      // ── campaign lifecycle ─────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaigns/${CID}/run`, method: "POST" })
        .reply(202, {
          id: RID,
          campaign_id: CID,
          label: "L",
          total: 1,
          completed: 0,
          failed: 0,
          partial: 0,
          cancelled: 0,
          source: "api",
          created_at: "2026-05-17T00:00:00Z",
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaigns/${CID}/cancel`, method: "POST" })
        .reply(200, { cancelled_count: 1 });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaigns/${CID}/unarchive`, method: "POST" })
        .reply(200, {
          id: CID,
          name: "X",
          campaign_type: "url",
          url: "https://x.com",
          ad_tag: null,
          country_codes: ["US"],
          group_id: GID,
          emulator_selection: { categories: ["android_phone"], specific_ids: [], mode: "random" },
          labels: {},
          policy_set_id: null,
          schedule_enabled: false,
          schedule_type: null,
          is_archived: false,
          created_at: "2026-05-17T00:00:00Z",
          last_run_at: null,
        });
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith(`/api/v1/campaigns/${CID}/runs?`), method: "GET" })
        .reply(200, { items: [], total: 0, page: 1, limit: 50 });
      // ── group lifecycle ────────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaign-groups/${GID}/run`, method: "POST" })
        .reply(202, {
          group_id: GID,
          affected_campaigns: 1,
          cancelled_count: 0,
          run_ids: [RID],
          failures: [],
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaign-groups/${GID}/cancel`, method: "POST" })
        .reply(200, {
          group_id: GID,
          affected_campaigns: 1,
          cancelled_count: 1,
          run_ids: [],
          failures: [],
        });
      // Archive / unarchive return a GroupActionResponse summary,
      // NOT the group entity (run/cancel-style envelope).
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaign-groups/${GID}/archive`, method: "POST" })
        .reply(200, {
          group_id: GID,
          affected_campaigns: 1,
          cancelled_count: 0,
          run_ids: [],
          failures: [],
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaign-groups/${GID}/unarchive`, method: "POST" })
        .reply(200, {
          group_id: GID,
          affected_campaigns: 0,
          cancelled_count: 0,
          run_ids: [],
          failures: [],
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaign-groups/${GID}/pause-schedule`, method: "POST" })
        .reply(200, {
          id: GID,
          name: "default",
          is_default: false,
          is_archived: false,
          schedule_paused: true,
          campaign_count: 0,
          created_at: "2026-05-17T00:00:00Z",
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaign-groups/${GID}/resume-schedule`, method: "POST" })
        .reply(200, {
          id: GID,
          name: "default",
          is_default: false,
          is_archived: false,
          schedule_paused: false,
          campaign_count: 0,
          created_at: "2026-05-17T00:00:00Z",
        });
      // ── runs ───────────────────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/runs/${RID}/cancel`, method: "POST" })
        .reply(200, { cancelled_count: 0 });
      // ── billing ────────────────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/billing/usage?"), method: "GET" })
        .reply(200, { items: [], total: 0, page: 1, limit: 50 });
      a.get(ORIGIN).intercept({ path: "/api/v1/billing/usage/summary", method: "GET" }).reply(200, {
        period_start: "2026-05-17T00:00:00Z",
        period_end: "2026-06-17T00:00:00Z",
        checks: 0,
        rechecks: 0,
        within_plan: 0,
        overage: 0,
        charged_micros: 0,
      });
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/billing/history?"), method: "GET" })
        .reply(200, { items: [], total: 0, page: 1, limit: 50 });
      // ── invoicing ──────────────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: (p) => p.startsWith("/api/v1/invoices?"), method: "GET" })
        .reply(200, { items: [], total: 0, page: 1, limit: 50 });
      // ── webhooks extras ────────────────────────────────────
      const WH_FULL = {
        id: WID,
        url: "https://x.com/wh",
        description: "ci",
        event_types: ["scan.done"],
        campaign_ids: [],
        is_active: true,
        disabled_reason: null,
        disabled_at: null,
        health: {
          consecutive_failures: 0,
          last_delivery_at: null,
          last_delivery_status: null,
          success_rate_7d: 1,
          failing_since: null,
          paused_until: null,
        },
        created_at: "2026-05-17T00:00:00Z",
        updated_at: "2026-05-17T00:00:00Z",
      };
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/webhooks/${WID}`, method: "GET" })
        .reply(200, WH_FULL);
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/webhooks/${WID}`, method: "PATCH" })
        .reply(200, WH_FULL);
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/webhooks/event-types", method: "GET" })
        .reply(200, { entries: [] });
      a.get(ORIGIN)
        .intercept({
          path: (p) => p.startsWith(`/api/v1/webhooks/${WID}/deliveries?`),
          method: "GET",
        })
        .reply(200, { items: [], total: 0, page: 1, limit: 50 });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/webhooks/${WID}/test`, method: "POST" })
        .reply(200, {
          success: true,
          response_status: 200,
          elapsed_ms: 12,
          error_code: null,
          response_body: "",
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/webhooks/${WID}/rotate-secret`, method: "POST" })
        .reply(200, {
          webhook: {
            id: WID,
            url: "https://x/wh",
            description: "",
            event_types: [],
            campaign_ids: [],
            is_active: true,
            disabled_reason: null,
            disabled_at: null,
            health: {
              consecutive_failures: 0,
              last_delivery_at: null,
              last_delivery_status: null,
              success_rate_7d: 1,
              failing_since: null,
              paused_until: null,
            },
            created_at: "2026-05-17T00:00:00Z",
            updated_at: "2026-05-17T00:00:00Z",
          },
          secret: "new",
        });
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/webhooks/deliveries/${AID}/replay`, method: "POST" })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/webhooks/${WID}/replay`, method: "POST" })
        .reply(200, { replayed: 0, skipped: 0 });
      // ── alert notifications ────────────────────────────────
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/alert-notifications/destinations", method: "GET" })
        .reply(200, []);
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/alert-notifications/destinations/${DID}`, method: "DELETE" })
        .reply(204, "");
      // API returns 204 No Content (see OpenAPI spec); gateway uses
      // `parseEmpty` and surfaces `Result<null>`. The previous
      // 200-with-body stub masked the real contract.
      a.get(ORIGIN)
        .intercept({
          path: `/api/v1/alert-notifications/destinations/${DID}/version`,
          method: "PATCH",
        })
        .reply(204, "");
      a.get(ORIGIN)
        .intercept({
          path: `/api/v1/alert-notifications/campaigns/${CID}/overrides`,
          method: "GET",
        })
        .reply(200, { campaign_id: CID, mode: "inherit", destination_ids: [] });
      a.get(ORIGIN)
        .intercept({
          path: `/api/v1/alert-notifications/campaigns/${CID}/overrides`,
          method: "PUT",
        })
        .reply(204, "");

      const gw = buildGateway(agent);
      expect((await gw.updateOrg({})).isOk()).toBe(true);
      expect((await gw.listOrgUsers()).isOk()).toBe(true);
      expect((await gw.inviteUser({ email: "x@y.com", role_id: UID })).isOk()).toBe(true);
      expect((await gw.updateUserRole(UID, { role_id: UID })).isOk()).toBe(true);
      expect((await gw.removeUser(UID)).isOk()).toBe(true);
      expect((await gw.transferOwnership(UID)).isOk()).toBe(true);
      expect((await gw.listOrgRoles()).isOk()).toBe(true);
      expect((await gw.createApiKey({ name: "n" })).isOk()).toBe(true);
      expect((await gw.revokeApiKey(KID)).isOk()).toBe(true);
      expect((await gw.listRunScans(RID, { page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.listScanTags(AID)).isOk()).toBe(true);
      expect((await gw.getTagDefinition("malware")).isOk()).toBe(true);
      expect((await gw.updateTagDefinition("malware", {})).isOk()).toBe(true);
      expect((await gw.deleteTagDefinition("malware")).isOk()).toBe(true);
      expect((await gw.getCustomRule(TR)).isOk()).toBe(true);
      expect((await gw.updateCustomRule(TR, {})).isOk()).toBe(true);
      expect(
        (
          await gw.testCustomRule({ rule_type: "regex", config: {}, target: "page", scan_id: AID })
        ).isOk()
      ).toBe(true);
      expect(
        (await gw.updatePolicySet(PID, { name: "x", description: "", entries: [] })).isOk()
      ).toBe(true);
      expect((await gw.deletePolicySet(PID)).isOk()).toBe(true);
      expect((await gw.requestPolicySetApproval(PID)).isOk()).toBe(true);
      expect((await gw.listPolicySetCampaigns(PID, { page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.attachPolicySetCampaigns(PID, { campaign_ids: [CID] })).isOk()).toBe(true);
      expect((await gw.detachPolicySetCampaigns(PID, { detach_all: true })).isOk()).toBe(true);
      expect((await gw.updateAlertStatus(AID, { status: "escalated" })).isOk()).toBe(true);
      expect(
        (await gw.bulkUpdateAlertStatus({ status: "resolved", all_matching: true })).isOk()
      ).toBe(true);
      expect((await gw.getAlertStats({})).isOk()).toBe(true);
      expect((await gw.runCampaign(CID)).isOk()).toBe(true);
      expect((await gw.cancelCampaign(CID)).isOk()).toBe(true);
      expect((await gw.unarchiveCampaign(CID)).isOk()).toBe(true);
      expect((await gw.listCampaignRuns(CID, { page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.runCampaignGroup(GID)).isOk()).toBe(true);
      expect((await gw.cancelCampaignGroup(GID)).isOk()).toBe(true);
      expect((await gw.archiveCampaignGroup(GID)).isOk()).toBe(true);
      expect((await gw.unarchiveCampaignGroup(GID)).isOk()).toBe(true);
      expect((await gw.pauseCampaignGroupSchedule(GID)).isOk()).toBe(true);
      expect((await gw.resumeCampaignGroupSchedule(GID)).isOk()).toBe(true);
      expect((await gw.cancelRun(RID)).isOk()).toBe(true);
      expect((await gw.listUsage({ page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.getUsageSummary()).isOk()).toBe(true);
      expect((await gw.listBalanceHistory({ page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.listInvoices({ page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.getWebhook(WID)).isOk()).toBe(true);
      expect((await gw.updateWebhook(WID, {})).isOk()).toBe(true);
      expect((await gw.listWebhookEventTypes()).isOk()).toBe(true);
      expect((await gw.listWebhookDeliveries(WID, { page: 1, limit: 50 })).isOk()).toBe(true);
      expect((await gw.testWebhook(WID, { event_type: "scanning.scan.completed" })).isOk()).toBe(
        true
      );
      expect((await gw.rotateWebhookSecret(WID)).isOk()).toBe(true);
      expect((await gw.replayWebhookDelivery(AID)).isOk()).toBe(true);
      expect(
        (
          await gw.bulkReplayWebhook(WID, {
            from_ts: "2026-01-01T00:00:00Z",
            to_ts: "2026-01-02T00:00:00Z",
          })
        ).isOk()
      ).toBe(true);
      expect((await gw.listAlertDestinations()).isOk()).toBe(true);
      expect((await gw.deleteAlertDestination(DID)).isOk()).toBe(true);
      expect((await gw.setAlertDestinationVersion(DID, { version: "public" })).isOk()).toBe(true);
      expect((await gw.getCampaignAlertOverrides(CID)).isOk()).toBe(true);
      expect(
        (
          await gw.setCampaignAlertOverrides(CID, {
            mode: "inherit",
            destination_ids: [],
          })
        ).isOk()
      ).toBe(true);
    });

    it("custom-taxonomies CRUD + parse-text + restore", async () => {
      const TID = "00000000-0000-0000-0000-000000000aa1";
      const TAXON = {
        id: TID,
        organization_id: "00000000-0000-0000-0000-000000000010",
        name: "Brand-safety",
        slug: "brand-safety",
        description: "",
        is_active: true,
        version: 1,
        nodes: [
          {
            id: "00000000-0000-0000-0000-000000000aaa",
            parent_id: null,
            level: 1,
            position: 0,
            name: "Other",
            description: "fallback",
            is_default: true,
          },
        ],
        created_at: "2026-05-20T00:00:00Z",
        updated_at: "2026-05-20T00:00:00Z",
      };
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/custom-taxonomies", method: "GET" })
        .reply(200, [
          {
            id: TID,
            name: "Brand-safety",
            slug: "brand-safety",
            description: "",
            is_active: true,
            version: 1,
            node_count: 1,
            created_at: "2026-05-20T00:00:00Z",
            updated_at: "2026-05-20T00:00:00Z",
          },
        ]);
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/custom-taxonomies", method: "POST" })
        .reply(201, TAXON);
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/custom-taxonomies/${TID}`, method: "GET" })
        .reply(200, TAXON);
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/custom-taxonomies/${TID}`, method: "PUT" })
        .reply(200, TAXON);
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/custom-taxonomies/${TID}`, method: "DELETE" })
        .reply(204, "");
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/custom-taxonomies/${TID}/restore`, method: "POST" })
        .reply(200, TAXON);
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/custom-taxonomies/parse-text", method: "POST" })
        .reply(200, { nodes: [{ level: 1, name: "Root", description: "" }], warnings: [] });

      const gw = buildGateway(agent);
      expect((await gw.listCustomTaxonomies()).isOk()).toBe(true);
      expect(
        (
          await gw.createCustomTaxonomy({
            name: "Brand-safety",
            description: "",
            nodes: [],
          })
        ).isOk()
      ).toBe(true);
      expect((await gw.getCustomTaxonomy(TID)).isOk()).toBe(true);
      expect(
        (
          await gw.updateCustomTaxonomy(TID, {
            name: "Brand-safety",
            description: "",
            nodes: [],
          })
        ).isOk()
      ).toBe(true);
      expect((await gw.deleteCustomTaxonomy(TID)).isOk()).toBe(true);
      expect((await gw.restoreCustomTaxonomy(TID)).isOk()).toBe(true);
      expect((await gw.parseCustomTaxonomyText({ text: "Root" })).isOk()).toBe(true);
    });

    it("account-labels CRUD + custom-role create", async () => {
      const ROLE = {
        id: "00000000-0000-0000-0000-000000000777",
        name: "Auditor",
        scope: "organization",
        is_system: false,
        permissions: ["scans.read"],
      };
      const LABELS = [
        { key: "brand_safety", display_name: "Brand Safety", position: 0, auto_extract: true },
      ];
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account/labels", method: "GET" })
        .reply(200, LABELS);
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account/labels", method: "PUT" })
        .reply(200, LABELS);
      agent
        .get(ORIGIN)
        .intercept({ path: "/api/v1/account/roles", method: "POST" })
        .reply(201, ROLE);

      const gw = buildGateway(agent);
      expect((await gw.listAccountLabels()).isOk()).toBe(true);
      expect(
        (
          await gw.updateAccountLabels({
            labels: [{ key: "brand_safety", display_name: "Brand Safety", auto_extract: true }],
          })
        ).isOk()
      ).toBe(true);
      expect(
        (await gw.createCustomRole({ name: "Auditor", permissions: ["scans.read"] })).isOk()
      ).toBe(true);
    });

    it("binary downloads — screenshots + invoice PDF (raw bytes path)", async () => {
      const SID = "00000000-0000-0000-0000-000000000aaa";
      const IID = "00000000-0000-0000-0000-000000000fff";
      const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const PDF = Buffer.from([0x25, 0x50, 0x44, 0x46]);
      agent
        .get(ORIGIN)
        .intercept({
          path: (p) =>
            p === `/api/v1/scans/${SID}/screenshot` ||
            p === `/api/v1/scans/${SID}/screenshot?w=800`,
          method: "GET",
        })
        .reply(200, PNG, { headers: { "content-type": "image/png" } })
        .times(2);
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/creative-screenshot`, method: "GET" })
        .reply(200, PNG, { headers: { "content-type": "image/png" } });
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/landings/2/screenshot`, method: "GET" })
        .reply(200, PNG, { headers: { "content-type": "image/png" } });
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/invoices/${IID}/pdf`, method: "GET" })
        .reply(200, PDF, { headers: { "content-type": "application/pdf" } });
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/creative-html`, method: "GET" })
        .reply(200, "<div>ad</div>", { headers: { "content-type": "text/plain" } });
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/creative-video`, method: "GET" })
        .reply(200, Buffer.from([0x00, 0x00, 0x00, 0x18]), {
          headers: { "content-type": "video/mp4" },
        });
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/vast-xml`, method: "GET" })
        .reply(200, "<VAST/>", { headers: { "content-type": "application/xml" } });

      const gw = buildGateway(agent);
      const ss1 = await gw.getScanScreenshot(SID);
      expect(ss1.isOk()).toBe(true);
      if (ss1.isOk()) expect(ss1.value.contentType).toBe("image/png");
      const ss2 = await gw.getScanScreenshot(SID, 800);
      expect(ss2.isOk()).toBe(true);
      expect((await gw.getScanCreativeScreenshot(SID)).isOk()).toBe(true);
      expect((await gw.getScanLandingScreenshot(SID, 2)).isOk()).toBe(true);
      const pdf = await gw.getInvoicePdf(IID);
      expect(pdf.isOk()).toBe(true);
      if (pdf.isOk()) {
        expect(pdf.value.contentType).toBe("application/pdf");
        expect(Array.from(pdf.value.bytes.slice(0, 4))).toEqual([0x25, 0x50, 0x44, 0x46]);
      }
      // Text artifacts ride the same binary path; the tool decodes.
      const html = await gw.getScanCreativeHtml(SID);
      expect(html.isOk()).toBe(true);
      if (html.isOk()) expect(html.value.contentType).toBe("text/plain");
      expect((await gw.getScanCreativeVideo(SID)).isOk()).toBe(true);
      const vast = await gw.getScanVastXml(SID);
      expect(vast.isOk()).toBe(true);
      if (vast.isOk()) expect(vast.value.contentType).toBe("application/xml");
    });

    it("binary download — 404 on screenshot is mapped to not-found", async () => {
      const SID = "00000000-0000-0000-0000-000000000aaa";
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/screenshot`, method: "GET" })
        .reply(404, { detail: "no screenshot" });
      const r = await buildGateway(agent).getScanScreenshot(SID);
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error.kind).toBe("not-found");
    });

    // The API caps no artifact, so without this the hosted server's
    // memory ceiling is whatever the largest MediaFile happens to be.
    it("binary download — refuses a body over the cap instead of buffering it", async () => {
      const SID = "00000000-0000-0000-0000-000000000aaa";
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/creative-video`, method: "GET" })
        .reply(200, Buffer.alloc(8 * 1024 * 1024 + 1), {
          headers: { "content-type": "video/mp4" },
        });

      const result = await buildGateway(agent).getScanCreativeVideo(SID);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        // `upstream`, not `invalid-input`: the agent's arguments were
        // fine, the artifact is simply too big to move.
        expect(result.error.kind).toBe("upstream");
        expect(result.error.detail).toContain("8.0 MiB");
      }
    });

    it("binary download — refuses on an oversized content-length alone", async () => {
      const SID = "00000000-0000-0000-0000-000000000aab";
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/creative-html`, method: "GET" })
        .reply(200, "<div>small body, lying header</div>", {
          headers: { "content-type": "text/plain", "content-length": "999999999" },
        });

      const result = await buildGateway(agent).getScanCreativeHtml(SID);
      expect(result.isErr()).toBe(true);
      // A body this small would have streamed fine, so an error here
      // can only mean the header fast path ran.
      if (result.isErr()) {
        expect(result.error.kind).toBe("upstream");
        expect(result.error.detail).toContain("256.0 KiB");
      }
    });

    it("binary download — a body at the cap still succeeds", async () => {
      const SID = "00000000-0000-0000-0000-000000000aac";
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/vast-xml`, method: "GET" })
        .reply(200, Buffer.alloc(256 * 1024), { headers: { "content-type": "application/xml" } });

      const result = await buildGateway(agent).getScanVastXml(SID);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) expect(result.value.bytes.byteLength).toBe(256 * 1024);
    });

    it("binary download — 500 on creative-screenshot is mapped to upstream", async () => {
      const SID = "00000000-0000-0000-0000-000000000aaa";
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/creative-screenshot`, method: "GET" })
        .reply(500, { detail: "boom" });
      const r = await buildGateway(agent).getScanCreativeScreenshot(SID);
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error.kind).toBe("upstream");
    });

    it("binary download — 404 on landing-screenshot is mapped to not-found", async () => {
      const SID = "00000000-0000-0000-0000-000000000aaa";
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/scans/${SID}/landings/0/screenshot`, method: "GET" })
        .reply(404, { detail: "no landing screenshot" });
      const r = await buildGateway(agent).getScanLandingScreenshot(SID, 0);
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error.kind).toBe("not-found");
    });

    it("binary download — 404 on invoice PDF is mapped to not-found", async () => {
      const IID = "00000000-0000-0000-0000-000000000fff";
      agent
        .get(ORIGIN)
        .intercept({ path: `/api/v1/invoices/${IID}/pdf`, method: "GET" })
        .reply(404, { detail: "missing" });
      const r = await buildGateway(agent).getInvoicePdf(IID);
      expect(r.isErr()).toBe(true);
      if (r.isErr()) expect(r.error.kind).toBe("not-found");
    });

    it("listCampaignGroups / getCampaignGroup / createCampaignGroup / updateCampaignGroup", async () => {
      const a = agent;
      // List returns a BARE ARRAY per OpenAPI — no envelope.
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/campaign-groups", method: "GET" })
        .reply(200, [GROUP]);
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaign-groups/${GROUP.id}`, method: "GET" })
        .reply(200, GROUP);
      a.get(ORIGIN)
        .intercept({ path: "/api/v1/campaign-groups", method: "POST" })
        .reply(201, GROUP);
      a.get(ORIGIN)
        .intercept({ path: `/api/v1/campaign-groups/${GROUP.id}`, method: "PATCH" })
        .reply(200, GROUP);

      const gw = buildGateway(agent);
      expect((await gw.listCampaignGroups()).isOk()).toBe(true);
      expect((await gw.getCampaignGroup(GROUP.id)).isOk()).toBe(true);
      expect((await gw.createCampaignGroup({ name: "x" })).isOk()).toBe(true);
      expect((await gw.updateCampaignGroup(GROUP.id, { name: "y" })).isOk()).toBe(true);
    });
  });
});
