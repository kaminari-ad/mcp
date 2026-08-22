import { describe, expect, it } from "vitest";

import { getAlertStatsTool } from "../../../../src/application/tools/alerts/get-alert-stats.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";

describe("getAlertStatsTool", () => {
  it("read-only", () => {
    expect(getAlertStatsTool.name).toBe("get_alert_stats");
    expect(getAlertStatsTool.annotations.readOnlyHint).toBe(true);
  });
  it("tells the model how the counts relate to the list total", () => {
    // The endpoint used to default to the last 30 days while the list
    // spanned all time, so a model comparing the two saw them disagree.
    // They agree now only when both get the same filters.
    expect(getAlertStatsTool.description).toContain("all time");
    expect(getAlertStatsTool.description).toContain(
      "the same filters to both makes the four counts sum to the `total`"
    );
  });
  it("scopes the counts to the caller's organization", () => {
    expect(getAlertStatsTool.description).toContain("the whole organization");
  });
  it("returns stats", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getAlertStats = ok({
      open: 3,
      escalated: 1,
      resolved: 5,
      dismissed: 0,
    });
    const r = await getAlertStatsTool.handler({}, makeToolContext({ api }));
    expect(r._unsafeUnwrap().open).toBe(3);
    expect(r._unsafeUnwrap().escalated).toBe(1);
    expect(r._unsafeUnwrap().resolved).toBe(5);
    expect(r._unsafeUnwrap().dismissed).toBe(0);
    expect(api.state.calls).toEqual([{ method: "getAlertStats", filters: {} }]);
  });

  // The endpoint accepts every list filter except `status`; the tool
  // used to accept none, so an agent could not size a filtered
  // selection before acting on it.
  it("forwards every supported filter", async () => {
    const api = createFakeApiGateway();
    await getAlertStatsTool.handler(
      {
        campaign_id: CID,
        policy_set_id: "p1,p2",
        tag: "malware,phishing",
        country_code: "DE,US",
        date_from: "2026-08-01",
        date_to: "2026-08-31",
        timezone: "Europe/Berlin",
      },
      makeToolContext({ api })
    );
    expect(api.state.calls[0]).toEqual({
      method: "getAlertStats",
      filters: {
        campaign_id: CID,
        policy_set_id: "p1,p2",
        tag: "malware,phishing",
        country_code: "DE,US",
        date_from: "2026-08-01",
        date_to: "2026-08-31",
        timezone: "Europe/Berlin",
      },
    });
  });
  it("omits absent filters instead of sending undefined", async () => {
    const api = createFakeApiGateway();
    await getAlertStatsTool.handler({ tag: "malware" }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "getAlertStats") throw new Error("wrong");
    expect(call.filters).toEqual({ tag: "malware" });
    expect("campaign_id" in call.filters).toBe(false);
  });
  it("does not accept a status filter — the response buckets by status", () => {
    const parsed = getAlertStatsTool.inputSchema.safeParse({ status: "open" });
    expect(parsed.success).toBe(true);
    expect(parsed.success && "status" in parsed.data).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getAlertStats = err(makeApiError("forbidden", "x"));
    expect((await getAlertStatsTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
