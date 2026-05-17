import { describe, expect, it } from "vitest";

import { replayWebhookDeliveryTool } from "../../../../src/application/tools/webhooks/replay-webhook-delivery.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const AID = "00000000-0000-0000-0000-000000000aaa";

describe("replayWebhookDeliveryTool", () => {
  it("name + non-idempotent (each call queues a new attempt)", () => {
    expect(replayWebhookDeliveryTool.name).toBe("replay_webhook_delivery");
    expect(replayWebhookDeliveryTool.annotations.idempotentHint).toBe(false);
  });
  it("returns queued=true", async () => {
    const api = createFakeApiGateway();
    const r = await replayWebhookDeliveryTool.handler(
      { attempt_id: AID },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap()).toEqual({ queued: true });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.replayWebhookDelivery = err(makeApiError("not-found", "x"));
    expect(
      (
        await replayWebhookDeliveryTool.handler({ attempt_id: AID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
