import { describe, expect, it } from "vitest";

import { updateWebhookTool } from "../../../../src/application/tools/webhooks/update-webhook.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";

describe("updateWebhookTool", () => {
  it("name", () => {
    expect(updateWebhookTool.name).toBe("update_webhook");
  });
  it("forwards only supplied fields", async () => {
    const api = createFakeApiGateway();
    await updateWebhookTool.handler(
      { webhook_id: WID, is_active: false },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateWebhook") throw new Error("wrong");
    expect(Object.keys(call.body)).toEqual(["is_active"]);
  });
  it("forwards full body when supplied", async () => {
    const api = createFakeApiGateway();
    await updateWebhookTool.handler(
      { webhook_id: WID, url: "https://x", event_types: ["scan.done"], is_active: true },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateWebhook") throw new Error("wrong");
    expect(call.body.url).toBe("https://x");
  });
  it("forwards description, campaign_ids and clear_campaign_ids", async () => {
    const api = createFakeApiGateway();
    await updateWebhookTool.handler(
      {
        webhook_id: WID,
        description: "prod hook",
        campaign_ids: ["00000000-0000-0000-0000-000000000ccc"],
        clear_campaign_ids: false,
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateWebhook") throw new Error("wrong");
    expect(call.body.description).toBe("prod hook");
    expect(call.body.campaign_ids).toEqual(["00000000-0000-0000-0000-000000000ccc"]);
    expect(call.body.clear_campaign_ids).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateWebhook = err(makeApiError("not-found", "x"));
    expect(
      (await updateWebhookTool.handler({ webhook_id: WID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
