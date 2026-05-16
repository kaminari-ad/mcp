import { describe, expect, it } from "vitest";

import { createWebhookTool } from "../../../../src/application/tools/webhooks/create-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createWebhookTool", () => {
  it("name + validates url and event_types", () => {
    expect(createWebhookTool.name).toBe("create_webhook");
    expect(() =>
      createWebhookTool.inputSchema.parse({ url: "not-a-url", event_types: ["x"] })
    ).toThrow();
    expect(() =>
      createWebhookTool.inputSchema.parse({ url: "https://x.com", event_types: [] })
    ).toThrow();
  });

  it("returns the response with signing_secret", async () => {
    const api = createFakeApiGateway();
    const r = await createWebhookTool.handler(
      { url: "https://x.com/wh", event_types: ["scan.done"] },
      makeToolContext({ api })
    );
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().signing_secret).toBe("whsec_abc");
  });

  it("forwards is_active when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createWebhookTool.handler(
      { url: "https://x.com/wh", event_types: ["scan.done"], is_active: false },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createWebhook") throw new Error("wrong");
    expect(call.body.is_active).toBe(false);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createWebhook = err(makeApiError("forbidden", "x"));
    expect(
      (
        await createWebhookTool.handler(
          { url: "https://x.com/wh", event_types: ["scan.done"] },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
