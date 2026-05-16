import { describe, expect, it } from "vitest";
import { listWebhookDeliveriesTool } from "../../../../src/application/tools/webhooks/list-webhook-deliveries.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";

describe("listWebhookDeliveriesTool", () => {
  it("name + pagination defaults", () => {
    expect(listWebhookDeliveriesTool.name).toBe("list_webhook_deliveries");
    expect(listWebhookDeliveriesTool.inputSchema.parse({ webhook_id: WID }).page).toBe(1);
  });
  it("forwards pagination", async () => {
    const api = createFakeApiGateway();
    await listWebhookDeliveriesTool.handler({ webhook_id: WID, page: 1, limit: 10 }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listWebhookDeliveries") throw new Error("wrong");
    expect(call.endpointId).toBe(WID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listWebhookDeliveries = err(makeApiError("not-found", "x"));
    expect(
      (await listWebhookDeliveriesTool.handler({ webhook_id: WID, page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
