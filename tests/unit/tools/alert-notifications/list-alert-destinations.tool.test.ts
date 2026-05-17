import { describe, expect, it } from "vitest";

import { listAlertDestinationsTool } from "../../../../src/application/tools/alert-notifications/list-alert-destinations.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listAlertDestinationsTool", () => {
  it("read-only", () => {
    expect(listAlertDestinationsTool.name).toBe("list_alert_destinations");
    expect(listAlertDestinationsTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listAlertDestinations = ok([
      {
        id: "d1",
        channel: "slack",
        name: "team",
        is_active: true,
        is_default_target: false,
        version: "public",
        consecutive_failures: 0,
        last_delivery_at: null,
        last_delivery_status: null,
        slack_workspace_id: null,
        slack_channel_name: "general",
        telegram_chat_title: null,
        telegram_chat_type: null,
        email_address: null,
        included_label_keys: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ]);
    const r = await listAlertDestinationsTool.handler({}, makeToolContext({ api }));
    expect(r._unsafeUnwrap().total).toBe(1);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listAlertDestinations = err(makeApiError("forbidden", "x"));
    expect((await listAlertDestinationsTool.handler({}, makeToolContext({ api }))).isErr()).toBe(
      true
    );
  });
});
