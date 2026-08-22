import { describe, expect, it } from "vitest";

import { listAlertsTool } from "../../../../src/application/tools/alerts/list-alerts.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listAlertsTool", () => {
  it("name + status enum validation", () => {
    expect(listAlertsTool.name).toBe("list_alerts");
    expect(() => listAlertsTool.inputSchema.parse({ status: "weird" })).toThrow();
  });

  it("accepts the four canonical AlertStatus values", () => {
    for (const status of ["open", "escalated", "resolved", "dismissed"] as const) {
      expect(listAlertsTool.inputSchema.parse({ status }).status).toBe(status);
    }
  });

  it("rejects legacy 'ack' / 'ignored' values now that API uses canonical names", () => {
    // Regression guard for the COOP-13940 P3 alert status enum drift —
    // sending the old values would 422 the API, and zod must catch it
    // before the request is built.
    expect(() => listAlertsTool.inputSchema.parse({ status: "ack" })).toThrow();
    expect(() => listAlertsTool.inputSchema.parse({ status: "ignored" })).toThrow();
  });

  it("forwards campaign_id + status filters", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listAlertsTool.handler(
      {
        campaign_id: "00000000-0000-0000-0000-000000000ccc",
        status: "open",
        page: 1,
        limit: 50,
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "listAlerts") throw new Error("wrong");
    expect(call.filters.campaign_id).toBe("00000000-0000-0000-0000-000000000ccc");
    expect(call.filters.status).toBe("open");
  });

  it("omits filters when undefined", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listAlertsTool.handler({ page: 1, limit: 50 }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "listAlerts") throw new Error("wrong");
    expect(call.filters).toEqual({ page: 1, limit: 50 });
  });

  // The API grew these filters and the tool did not follow, so an agent
  // could only ever narrow alerts by campaign and status.
  it("forwards the policy-set, tag, country and date filters", async () => {
    const api = createFakeApiGateway();
    await listAlertsTool.handler(
      {
        policy_set_id: "p1,p2",
        tag: "malware,phishing",
        country_code: "DE,US",
        date_from: "2026-08-01",
        date_to: "2026-08-31",
        timezone: "Europe/Berlin",
        page: 1,
        limit: 50,
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listAlerts") throw new Error("wrong");
    expect(call.filters).toEqual({
      page: 1,
      limit: 50,
      policy_set_id: "p1,p2",
      tag: "malware,phishing",
      country_code: "DE,US",
      date_from: "2026-08-01",
      date_to: "2026-08-31",
      timezone: "Europe/Berlin",
    });
  });

  it("rejects a malformed date bound", () => {
    expect(() => listAlertsTool.inputSchema.parse({ date_from: "01/08/2026" })).toThrow();
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listAlerts = err(makeApiError("forbidden", "x"));
    expect(
      (await listAlertsTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
