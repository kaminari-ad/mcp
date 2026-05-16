import { describe, expect, it } from "vitest";
import { getUsageSummaryTool } from "../../../../src/application/tools/billing/get-usage-summary.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getUsageSummaryTool", () => {
  it("read-only", () => {
    expect(getUsageSummaryTool.name).toBe("get_usage_summary");
    expect(getUsageSummaryTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns summary", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getUsageSummary = ok({
      total_micros: 1000,
      checks_count: 5,
      period_start: "2026-05-01T00:00:00Z",
      period_end: "2026-06-01T00:00:00Z",
    });
    const r = await getUsageSummaryTool.handler({}, makeToolContext({ api }));
    expect(r._unsafeUnwrap().checks_count).toBe(5);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getUsageSummary = err(makeApiError("forbidden", "x"));
    expect((await getUsageSummaryTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
