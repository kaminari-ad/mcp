import { describe, expect, it } from "vitest";

import { listAlertsTool } from "../../../../src/application/tools/alerts/list-alerts.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listAlertsTool", () => {
  it("name + status enum validation", () => {
    expect(listAlertsTool.name).toBe("list_alerts");
    expect(() => listAlertsTool.inputSchema.parse({ status: "weird" })).toThrow();
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
    expect(call.filters.campaign_id).toBeUndefined();
    expect(call.filters.status).toBeUndefined();
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listAlerts = err(makeApiError("forbidden", "x"));
    expect(
      (await listAlertsTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
