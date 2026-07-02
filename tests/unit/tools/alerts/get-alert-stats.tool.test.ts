import { describe, expect, it } from "vitest";

import { getAlertStatsTool } from "../../../../src/application/tools/alerts/get-alert-stats.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getAlertStatsTool", () => {
  it("read-only", () => {
    expect(getAlertStatsTool.name).toBe("get_alert_stats");
    expect(getAlertStatsTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns stats", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getAlertStats = ok({
      open: 3,
      escalated: 1,
      resolved: 5,
      dismissed: 0,
    });
    const r = await getAlertStatsTool.handler({}, makeToolContext({ api }));
    expect(r._unsafeUnwrap().open).toBe(3);
    expect(r._unsafeUnwrap().escalated).toBe(1);
    expect(r._unsafeUnwrap().resolved).toBe(5);
    expect(r._unsafeUnwrap().dismissed).toBe(0);
    expect(api.state.calls).toEqual([{ method: "getAlertStats" }]);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getAlertStats = err(makeApiError("forbidden", "x"));
    expect((await getAlertStatsTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
