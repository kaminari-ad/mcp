import { describe, expect, it } from "vitest";

import { testWebhookTool } from "../../../../src/application/tools/webhooks/test-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";

describe("testWebhookTool", () => {
  it("name", () => {
    expect(testWebhookTool.name).toBe("test_webhook");
  });

  it("requires event_type in the input schema", () => {
    // `webhook_id` alone is insufficient — the API would 422 otherwise.
    expect(() => testWebhookTool.inputSchema.parse({ webhook_id: WID })).toThrow();
  });

  it("forwards { event_type } body to the gateway", async () => {
    const api = createFakeApiGateway();
    await testWebhookTool.handler(
      { webhook_id: WID, event_type: "scanning.scan.completed" },
      makeToolContext({ api })
    );
    expect(api.state.calls[0]).toEqual({
      method: "testWebhook",
      endpointId: WID,
      body: { event_type: "scanning.scan.completed" },
    });
  });

  it("returns the synchronous TestWebhookResponse on success", async () => {
    const api = createFakeApiGateway();
    api.state.responses.testWebhook = ok({
      success: false,
      response_status: 502,
      elapsed_ms: 120,
      error_code: "connect",
      response_body: "",
    });
    const r = await testWebhookTool.handler(
      { webhook_id: WID, event_type: "scanning.scan.completed" },
      makeToolContext({ api })
    );
    const payload = r._unsafeUnwrap();
    expect(payload.success).toBe(false);
    expect(payload.response_status).toBe(502);
    expect(payload.error_code).toBe("connect");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.testWebhook = err(makeApiError("not-found", "x"));
    expect(
      (
        await testWebhookTool.handler(
          { webhook_id: WID, event_type: "scanning.scan.completed" },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
