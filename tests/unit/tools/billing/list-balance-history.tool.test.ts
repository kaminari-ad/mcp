import { describe, expect, it } from "vitest";
import { listBalanceHistoryTool } from "../../../../src/application/tools/billing/list-balance-history.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listBalanceHistoryTool", () => {
  it("read-only", () => {
    expect(listBalanceHistoryTool.name).toBe("list_balance_history");
    expect(listBalanceHistoryTool.annotations.readOnlyHint).toBe(true);
  });
  it("forwards optional date filters", async () => {
    const api = createFakeApiGateway();
    await listBalanceHistoryTool.handler(
      { date_from: "2026-01-01", date_to: "2026-02-01", page: 1, limit: 50 },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listBalanceHistory") throw new Error("wrong");
    expect(call.filters.date_from).toBe("2026-01-01");
  });
  it("omits filters when undefined", async () => {
    const api = createFakeApiGateway();
    await listBalanceHistoryTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listBalanceHistory") throw new Error("wrong");
    expect(call.filters.date_from).toBeUndefined();
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listBalanceHistory = err(makeApiError("forbidden", "x"));
    expect(
      (await listBalanceHistoryTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
