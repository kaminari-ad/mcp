import { describe, expect, it } from "vitest";
import { testWebhookTool } from "../../../../src/application/tools/webhooks/test-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";

describe("testWebhookTool", () => {
  it("name", () => {
    expect(testWebhookTool.name).toBe("test_webhook");
  });
  it("returns dispatched=true", async () => {
    const api = createFakeApiGateway();
    const r = await testWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({ dispatched: true });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.testWebhook = err(makeApiError("not-found", "x"));
    expect((await testWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
