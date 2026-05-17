import { describe, expect, it } from "vitest";

import { listCampaignGroupsTool } from "../../../../src/application/tools/campaign-groups/list-campaign-groups.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listCampaignGroupsTool", () => {
  it("name + defaults", () => {
    expect(listCampaignGroupsTool.name).toBe("list_campaign_groups");
    // Endpoint is NOT paginated — schema only accepts `archived?`.
    const parsed = listCampaignGroupsTool.inputSchema.parse({});
    expect(parsed.archived).toBeUndefined();
  });

  it("calls gateway with no filter when `archived` is omitted", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listCampaignGroupsTool.handler({}, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "listCampaignGroups") throw new Error("wrong");
    expect(call.filters).toEqual({});
  });

  it("passes `archived` filter through to the gateway", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listCampaignGroupsTool.handler({ archived: true }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "listCampaignGroups") throw new Error("wrong");
    expect(call.filters).toEqual({ archived: true });
  });

  it("wraps the bare-array gateway response in { items }", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCampaignGroups = ok([
      {
        id: "00000000-0000-0000-0000-000000000111",
        name: "G",
        is_default: false,
        is_archived: false,
        schedule_paused: false,
        created_at: "2026-05-17T00:00:00Z",
        campaign_count: 3,
      },
    ]);
    const r = await listCampaignGroupsTool.handler({}, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({
      items: [
        {
          id: "00000000-0000-0000-0000-000000000111",
          name: "G",
          is_default: false,
          is_archived: false,
          schedule_paused: false,
          created_at: "2026-05-17T00:00:00Z",
          campaign_count: 3,
        },
      ],
    });
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCampaignGroups = err(makeApiError("forbidden", "x"));
    const ctx = makeToolContext({ api });
    expect((await listCampaignGroupsTool.handler({}, ctx)).isErr()).toBe(true);
  });
});
