import { describe, expect, it } from "vitest";

import { listWebhooksTool } from "../../../../src/application/tools/webhooks/list-webhooks.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listWebhooksTool", () => {
  it("name", () => {
    expect(listWebhooksTool.name).toBe("list_webhooks");
  });

  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listWebhooks = ok([
      {
        id: "00000000-0000-0000-0000-000000000eee",
        url: "https://x.com/wh",
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
      },
    ]);
    const r = await listWebhooksTool.handler({}, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().total).toBe(1);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listWebhooks = err(makeApiError("forbidden", "x"));
    expect((await listWebhooksTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
