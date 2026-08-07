import { describe, expect, it } from "vitest";

import { getAlertStatsTool } from "../../../../src/application/tools/alerts/get-alert-stats.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getAlertStatsTool", () => {
  it("read-only", () => {
    expect(getAlertStatsTool.name).toBe("get_alert_stats");
    expect(getAlertStatsTool.annotations.readOnlyHint).toBe(true);
  });
  it("tells the model the counts are unfiltered and all-time", () => {
    // The endpoint used to default to the last 30 days, so a model that
    // compared these counts against `list_alerts` saw them disagree.
    expect(getAlertStatsTool.description).toContain("all time");
    expect(getAlertStatsTool.description).toContain(
      "sum to the `total` an unfiltered `list_alerts` reports"
    );
  });
  it("scopes the counts to the caller's organization", () => {
    expect(getAlertStatsTool.description).toContain("the caller's organization");
    expect(getAlertStatsTool.description).not.toContain("the whole organization");
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
