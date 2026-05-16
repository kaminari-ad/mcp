import { describe, expect, it } from "vitest";
import { listWebhookEventTypesTool } from "../../../../src/application/tools/webhooks/list-webhook-event-types.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listWebhookEventTypesTool", () => {
  it("read-only", () => {
    expect(listWebhookEventTypesTool.name).toBe("list_webhook_event_types");
    expect(listWebhookEventTypesTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listWebhookEventTypes = ok([
      { type: "scan.done", description: "Scan finished" },
    ]);
    const r = await listWebhookEventTypesTool.handler({}, makeToolContext({ api }));
    expect(r._unsafeUnwrap().total).toBe(1);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listWebhookEventTypes = err(makeApiError("forbidden", "x"));
    expect((await listWebhookEventTypesTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
