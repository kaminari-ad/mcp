import { describe, expect, it } from "vitest";

import { listCampaignsTool } from "../../../../src/application/tools/campaigns/list-campaigns.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listCampaignsTool", () => {
  it("has canonical name and pagination defaults", () => {
    expect(listCampaignsTool.name).toBe("list_campaigns");
    const parsed = listCampaignsTool.inputSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(50);
  });

  it("forwards group_id when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listCampaignsTool.handler(
      { page: 1, limit: 50, group_id: "00000000-0000-0000-0000-000000000111" },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "listCampaigns") throw new Error("wrong method");
    expect(call.filters.group_id).toBe("00000000-0000-0000-0000-000000000111");
  });

  it("omits group_id when undefined", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listCampaignsTool.handler({ page: 1, limit: 50 }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "listCampaigns") throw new Error("wrong method");
    expect(call.filters.group_id).toBeUndefined();
  });

  it("rejects invalid group_id uuid + out-of-range page/limit", () => {
    expect(() => listCampaignsTool.inputSchema.parse({ group_id: "nope" })).toThrow();
    expect(() => listCampaignsTool.inputSchema.parse({ limit: 201 })).toThrow();
    expect(() => listCampaignsTool.inputSchema.parse({ page: 0 })).toThrow();
  });

  it("forwards archived + q filters", async () => {
    const api = createFakeApiGateway();
    await listCampaignsTool.handler(
      { page: 1, limit: 50, archived: true, q: "Holiday" },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listCampaigns") throw new Error("wrong method");
    expect(call.filters.archived).toBe(true);
    expect(call.filters.q).toBe("Holiday");
  });

  // Creation and last-run bounds landed on the endpoint but not here,
  // so "campaigns that have not run this week" was unanswerable.
  it("forwards the creation and last-run date bounds", async () => {
    const api = createFakeApiGateway();
    await listCampaignsTool.handler(
      {
        page: 1,
        limit: 50,
        created_from: "2026-08-01",
        created_to: "2026-08-31",
        last_run_from: "2026-08-20",
        last_run_to: "2026-08-22",
        timezone: "Europe/Berlin",
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listCampaigns") throw new Error("wrong method");
    expect(call.filters).toEqual({
      page: 1,
      limit: 50,
      created_from: "2026-08-01",
      created_to: "2026-08-31",
      last_run_from: "2026-08-20",
      last_run_to: "2026-08-22",
      timezone: "Europe/Berlin",
    });
  });

  it("rejects a malformed date bound", () => {
    expect(() => listCampaignsTool.inputSchema.parse({ last_run_to: "2026-8-1" })).toThrow();
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCampaigns = err(makeApiError("forbidden", "no"));
    const ctx = makeToolContext({ api });
    expect((await listCampaignsTool.handler({ page: 1, limit: 50 }, ctx)).isErr()).toBe(true);
  });
});
