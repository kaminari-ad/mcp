import { describe, expect, it } from "vitest";
import { getWebhookTool } from "../../../../src/application/tools/webhooks/get-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";

describe("getWebhookTool", () => {
  it("read-only", () => {
    expect(getWebhookTool.name).toBe("get_webhook");
    expect(getWebhookTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns webhook", async () => {
    const api = createFakeApiGateway();
    const r = await getWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().id).toBe(WID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getWebhook = err(makeApiError("not-found", "x"));
    expect((await getWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
