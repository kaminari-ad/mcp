import { describe, expect, it } from "vitest";
import { bulkReplayWebhookTool } from "../../../../src/application/tools/webhooks/bulk-replay-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";
const AID = "00000000-0000-0000-0000-000000000aaa";

describe("bulkReplayWebhookTool", () => {
  it("name", () => {
    expect(bulkReplayWebhookTool.name).toBe("bulk_replay_webhook");
  });
  it("forwards attempt_ids when supplied", async () => {
    const api = createFakeApiGateway();
    await bulkReplayWebhookTool.handler(
      { webhook_id: WID, attempt_ids: [AID] },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "bulkReplayWebhook") throw new Error("wrong");
    expect(call.body.attempt_ids).toEqual([AID]);
  });
  it("omits attempt_ids when not supplied (replay all failed)", async () => {
    const api = createFakeApiGateway();
    api.state.responses.bulkReplayWebhook = ok({ replayed_count: 42 });
    const r = await bulkReplayWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().replayed_count).toBe(42);
    const call = api.state.calls[0];
    if (call?.method !== "bulkReplayWebhook") throw new Error("wrong");
    expect(call.body.attempt_ids).toBeUndefined();
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.bulkReplayWebhook = err(makeApiError("forbidden", "x"));
    expect((await bulkReplayWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
