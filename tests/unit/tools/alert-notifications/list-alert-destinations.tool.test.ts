import { describe, expect, it } from "vitest";
import { listAlertDestinationsTool } from "../../../../src/application/tools/alert-notifications/list-alert-destinations.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listAlertDestinationsTool", () => {
  it("read-only", () => {
    expect(listAlertDestinationsTool.name).toBe("list_alert_destinations");
    expect(listAlertDestinationsTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listAlertDestinations = ok([
      { id: "d1", kind: "slack", name: "team", version: 1, created_at: "2026-01-01T00:00:00Z" },
    ]);
    const r = await listAlertDestinationsTool.handler({}, makeToolContext({ api }));
    expect(r._unsafeUnwrap().total).toBe(1);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listAlertDestinations = err(makeApiError("forbidden", "x"));
    expect((await listAlertDestinationsTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
