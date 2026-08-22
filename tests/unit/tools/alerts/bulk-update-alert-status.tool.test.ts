import { describe, expect, it } from "vitest";

import { bulkUpdateAlertStatusTool } from "../../../../src/application/tools/alerts/bulk-update-alert-status.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const A1 = "00000000-0000-0000-0000-0000000000a1";
const A2 = "00000000-0000-0000-0000-0000000000a2";
const CID = "00000000-0000-0000-0000-000000000ccc";

describe("bulkUpdateAlertStatusTool", () => {
  it("idempotent", () => {
    expect(bulkUpdateAlertStatusTool.name).toBe("bulk_update_alert_status");
    expect(bulkUpdateAlertStatusTool.annotations.idempotentHint).toBe(true);
  });
  it("forwards an explicit id list with all_matching false", async () => {
    const api = createFakeApiGateway();
    api.state.responses.bulkUpdateAlertStatus = ok({ updated: 2, skipped: 0 });
    const r = await bulkUpdateAlertStatusTool.handler(
      { status: "resolved", ids: [A1, A2] },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap()).toEqual({ updated: 2, skipped: 0 });
    expect(api.state.calls[0]).toEqual({
      method: "bulkUpdateAlertStatus",
      body: { status: "resolved", all_matching: false, ids: [A1, A2] },
    });
  });
  it("forwards all_matching with its filters", async () => {
    const api = createFakeApiGateway();
    await bulkUpdateAlertStatusTool.handler(
      {
        status: "dismissed",
        all_matching: true,
        filter_status: "open",
        filter_campaign_id: CID,
        filter_tag_slugs: ["malware"],
        filter_date_from: "2026-08-01",
        filter_timezone: "Europe/Berlin",
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "bulkUpdateAlertStatus") throw new Error("wrong");
    expect(call.body).toEqual({
      status: "dismissed",
      all_matching: true,
      filter_status: "open",
      filter_campaign_id: CID,
      filter_tag_slugs: ["malware"],
      filter_date_from: "2026-08-01",
      filter_timezone: "Europe/Berlin",
    });
  });
  it("forwards the remaining collection filters", async () => {
    const api = createFakeApiGateway();
    await bulkUpdateAlertStatusTool.handler(
      {
        status: "resolved",
        all_matching: true,
        filter_policy_set_ids: [CID],
        filter_country_codes: ["DE"],
        filter_date_to: "2026-08-31",
        filter_timezone: "UTC",
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "bulkUpdateAlertStatus") throw new Error("wrong");
    expect(call.body.filter_policy_set_ids).toEqual([CID]);
    expect(call.body.filter_country_codes).toEqual(["DE"]);
    expect(call.body.filter_date_to).toBe("2026-08-31");
  });

  // The API rejects an ambiguous selection; catching it here saves a
  // round trip and gives the agent a message it can act on.
  it("rejects both ids and all_matching", async () => {
    const api = createFakeApiGateway();
    const r = await bulkUpdateAlertStatusTool.handler(
      { status: "resolved", ids: [A1], all_matching: true },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().kind).toBe("invalid-input");
    expect(api.state.calls).toHaveLength(0);
  });
  it("rejects neither ids nor all_matching", async () => {
    const api = createFakeApiGateway();
    const r = await bulkUpdateAlertStatusTool.handler(
      { status: "resolved" },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
    expect(api.state.calls).toHaveLength(0);
  });
  it("requires a timezone alongside a filter date", async () => {
    const api = createFakeApiGateway();
    const r = await bulkUpdateAlertStatusTool.handler(
      { status: "resolved", all_matching: true, filter_date_from: "2026-08-01" },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().kind).toBe("invalid-input");
    expect(api.state.calls).toHaveLength(0);
  });
  it("requires a timezone when only filter_date_to is set", async () => {
    const api = createFakeApiGateway();
    const r = await bulkUpdateAlertStatusTool.handler(
      { status: "resolved", all_matching: true, filter_date_to: "2026-08-31" },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
    expect(api.state.calls).toHaveLength(0);
  });
  it("caps the id list at the API's 1000 limit", () => {
    const parsed = bulkUpdateAlertStatusTool.inputSchema.safeParse({
      status: "resolved",
      ids: Array.from({ length: 1001 }, () => A1),
    });
    expect(parsed.success).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.bulkUpdateAlertStatus = err(makeApiError("forbidden", "x"));
    expect(
      (
        await bulkUpdateAlertStatusTool.handler(
          { status: "resolved", ids: [A1] },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
