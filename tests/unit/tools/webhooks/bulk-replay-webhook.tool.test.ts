import { describe, expect, it } from "vitest";

import { bulkReplayWebhookTool } from "../../../../src/application/tools/webhooks/bulk-replay-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";
const FROM = "2026-01-01T00:00:00Z";
const TO = "2026-01-02T00:00:00Z";

describe("bulkReplayWebhookTool", () => {
  it("name + validates ISO timestamps", () => {
    expect(bulkReplayWebhookTool.name).toBe("bulk_replay_webhook");
    expect(() =>
      bulkReplayWebhookTool.inputSchema.parse({
        webhook_id: WID,
        from_ts: "not-iso",
        to_ts: TO,
      })
    ).toThrow();
  });

  it("forwards from_ts + to_ts and returns the counts", async () => {
    const api = createFakeApiGateway();
    api.state.responses.bulkReplayWebhook = ok({ replayed: 42, skipped: 3 });
    const r = await bulkReplayWebhookTool.handler(
      { webhook_id: WID, from_ts: FROM, to_ts: TO },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().replayed).toBe(42);
    expect(r._unsafeUnwrap().skipped).toBe(3);
    const call = api.state.calls[0];
    if (call?.method !== "bulkReplayWebhook") throw new Error("wrong");
    expect(call.endpointId).toBe(WID);
    expect(call.body).toEqual({ from_ts: FROM, to_ts: TO });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.bulkReplayWebhook = err(makeApiError("forbidden", "x"));
    expect(
      (
        await bulkReplayWebhookTool.handler(
          { webhook_id: WID, from_ts: FROM, to_ts: TO },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
