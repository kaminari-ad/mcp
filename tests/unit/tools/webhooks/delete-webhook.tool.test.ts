import { describe, expect, it } from "vitest";

import { deleteWebhookTool } from "../../../../src/application/tools/webhooks/delete-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";

describe("deleteWebhookTool", () => {
  it("name + uuid", () => {
    expect(deleteWebhookTool.name).toBe("delete_webhook");
    expect(() => deleteWebhookTool.inputSchema.parse({ webhook_id: "x" })).toThrow();
  });

  it("returns { deleted: true } and forwards the webhook id", async () => {
    const api = createFakeApiGateway();
    const r = await deleteWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ deleted: true });
    expect(api.state.calls[0]).toEqual({ method: "deleteWebhook", id: WID });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.deleteWebhook = err(makeApiError("not-found", "x"));
    expect(
      (await deleteWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
