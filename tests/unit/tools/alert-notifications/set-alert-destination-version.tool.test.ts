import { describe, expect, it } from "vitest";

import { setAlertDestinationVersionTool } from "../../../../src/application/tools/alert-notifications/set-alert-destination-version.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const DID = "00000000-0000-0000-0000-000000000999";

describe("setAlertDestinationVersionTool", () => {
  it("idempotent", () => {
    expect(setAlertDestinationVersionTool.name).toBe("set_alert_destination_version");
    expect(setAlertDestinationVersionTool.annotations.idempotentHint).toBe(true);
  });
  it("forwards version on the call body and returns { updated: true } on 204", async () => {
    const api = createFakeApiGateway();
    const r = await setAlertDestinationVersionTool.handler(
      { destination_id: DID, version: "internal" },
      makeToolContext({ api })
    );
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ updated: true });
    const call = api.state.calls[0];
    if (call?.method !== "setAlertDestinationVersion") throw new Error("wrong");
    expect(call.id).toBe(DID);
    expect(call.body).toEqual({ version: "internal" });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.setAlertDestinationVersion = err(makeApiError("not-found", "x"));
    expect(
      (
        await setAlertDestinationVersionTool.handler(
          { destination_id: DID, version: "public" },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
