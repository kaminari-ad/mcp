import { describe, expect, it } from "vitest";

import { rotateWebhookSecretTool } from "../../../../src/application/tools/webhooks/rotate-webhook-secret.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const WID = "00000000-0000-0000-0000-000000000eee";

describe("rotateWebhookSecretTool", () => {
  it("destructive (invalidates old secret)", () => {
    expect(rotateWebhookSecretTool.name).toBe("rotate_webhook_secret");
    expect(rotateWebhookSecretTool.annotations.destructiveHint).toBe(true);
  });
  it("returns new secret in the wrapped envelope", async () => {
    const api = createFakeApiGateway();
    const r = await rotateWebhookSecretTool.handler({ webhook_id: WID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().secret).toBe("whsec_rotated");
    expect(r._unsafeUnwrap().webhook.id).toBe(WID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.rotateWebhookSecret = err(makeApiError("not-found", "x"));
    expect(
      (await rotateWebhookSecretTool.handler({ webhook_id: WID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
