import { describe, expect, it } from "vitest";

import { deleteAlertDestinationTool } from "../../../../src/application/tools/alert-notifications/delete-alert-destination.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const DID = "00000000-0000-0000-0000-000000000999";

describe("deleteAlertDestinationTool", () => {
  it("destructive", () => {
    expect(deleteAlertDestinationTool.name).toBe("delete_alert_destination");
    expect(deleteAlertDestinationTool.annotations.destructiveHint).toBe(true);
  });
  it("returns deleted=true and forwards the destination id", async () => {
    const api = createFakeApiGateway();
    const r = await deleteAlertDestinationTool.handler(
      { destination_id: DID },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap()).toEqual({ deleted: true });
    expect(api.state.calls[0]).toEqual({ method: "deleteAlertDestination", id: DID });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.deleteAlertDestination = err(makeApiError("not-found", "x"));
    expect(
      (
        await deleteAlertDestinationTool.handler({ destination_id: DID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
