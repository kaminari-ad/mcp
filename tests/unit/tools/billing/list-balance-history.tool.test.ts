import { describe, expect, it } from "vitest";
import type { z } from "zod";

import { listBalanceHistoryTool } from "../../../../src/application/tools/billing/list-balance-history.tool.js";
import { schemas } from "../../../../src/shared/api/zod-schemas.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

/** The enum inside `type: z.array(TransactionTypeEnum).max(...).optional()`. */
const transactionTypeOptions = (): readonly string[] =>
  (
    listBalanceHistoryTool.inputSchema.shape.type.unwrap().element as z.ZodEnum<
      [string, ...string[]]
    >
  ).options;

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

  it("forwards multi-value type filter", async () => {
    const api = createFakeApiGateway();
    await listBalanceHistoryTool.handler(
      { type: ["top_up_manual", "crypto_top_up"], page: 1, limit: 50 },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listBalanceHistory") throw new Error("wrong");
    expect(call.filters.type).toEqual(["top_up_manual", "crypto_top_up"]);
  });

  it("rejects unknown transaction-type values", () => {
    expect(() =>
      listBalanceHistoryTool.inputSchema.parse({ type: ["weird"], page: 1, limit: 50 })
    ).toThrow();
  });

  it("offers exactly the transaction types the generated schema declares", () => {
    // Drift here is invisible to tsc — a value the API returns but this
    // enum lacks is unfilterable while unfiltered calls still show it.
    expect([...transactionTypeOptions()].sort()).toEqual(
      [...schemas.BalanceTransactionType.options].sort()
    );
  });

  it("accepts every transaction type in one filter", () => {
    // Guards the `.max()` ceiling against going stale as the enum grows.
    const all = [...schemas.BalanceTransactionType.options];
    expect(
      listBalanceHistoryTool.inputSchema.parse({ type: all, page: 1, limit: 50 }).type
    ).toEqual(all);
  });

  it("forwards a card_top_up filter to the API", async () => {
    const api = createFakeApiGateway();
    await listBalanceHistoryTool.handler(
      { type: ["card_top_up"], page: 1, limit: 50 },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listBalanceHistory") throw new Error("wrong");
    expect(call.filters.type).toEqual(["card_top_up"]);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listBalanceHistory = err(makeApiError("forbidden", "x"));
    expect(
      (
        await listBalanceHistoryTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
