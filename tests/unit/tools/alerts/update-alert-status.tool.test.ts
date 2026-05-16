import { describe, expect, it } from "vitest";
import { updateAlertStatusTool } from "../../../../src/application/tools/alerts/update-alert-status.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const AID = "00000000-0000-0000-0000-000000000aaa";

describe("updateAlertStatusTool", () => {
  it("name + enum validation", () => {
    expect(updateAlertStatusTool.name).toBe("update_alert_status");
    expect(() => updateAlertStatusTool.inputSchema.parse({ alert_id: AID, status: "weird" })).toThrow();
  });
  it("forwards status", async () => {
    const api = createFakeApiGateway();
    await updateAlertStatusTool.handler({ alert_id: AID, status: "resolved" }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "updateAlertStatus") throw new Error("wrong");
    expect(call.body.status).toBe("resolved");
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateAlertStatus = err(makeApiError("not-found", "x"));
    expect(
      (await updateAlertStatusTool.handler({ alert_id: AID, status: "ack" }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
