import { describe, expect, it } from "vitest";

import { createWebhookTool } from "../../../../src/application/tools/webhooks/create-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createWebhookTool", () => {
  it("name + validates url", () => {
    expect(createWebhookTool.name).toBe("create_webhook");
    expect(() => createWebhookTool.inputSchema.parse({ url: "not-a-url" })).toThrow();
  });

  it("forwards the URL + returns the wrapped { webhook, secret } envelope", async () => {
    const api = createFakeApiGateway();
    const r = await createWebhookTool.handler(
      { url: "https://x.com/wh", description: "ci", event_types: ["scan.done"], campaign_ids: [] },
      makeToolContext({ api })
    );
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().secret).toBe("whsec_abc");
    expect(r._unsafeUnwrap().webhook).toBeDefined();
    const call = api.state.calls[0];
    if (call?.method !== "createWebhook") throw new Error("wrong");
    expect(call.body.url).toBe("https://x.com/wh");
    expect(call.body.description).toBe("ci");
  });

  it("forwards description + campaign_ids", async () => {
    const api = createFakeApiGateway();
    await createWebhookTool.handler(
      {
        url: "https://x.com/wh",
        description: "prod",
        event_types: ["scan.done"],
        campaign_ids: ["00000000-0000-0000-0000-000000000ccc"],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createWebhook") throw new Error("wrong");
    expect(call.body.description).toBe("prod");
    expect(call.body.campaign_ids).toEqual(["00000000-0000-0000-0000-000000000ccc"]);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createWebhook = err(makeApiError("forbidden", "x"));
    expect(
      (
        await createWebhookTool.handler(
          { url: "https://x.com/wh", description: "", event_types: [], campaign_ids: [] },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
