import { describe, expect, it } from "vitest";

import { listInvoicesTool } from "../../../../src/application/tools/invoicing/list-invoices.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listInvoicesTool", () => {
  it("read-only + defaults", () => {
    expect(listInvoicesTool.name).toBe("list_invoices");
    expect(listInvoicesTool.annotations.readOnlyHint).toBe(true);
    expect(listInvoicesTool.inputSchema.parse({}).limit).toBe(50);
  });
  it("forwards pagination", async () => {
    const api = createFakeApiGateway();
    await listInvoicesTool.handler({ page: 2, limit: 10 }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listInvoices") throw new Error("wrong");
    expect(call.filters).toEqual({ page: 2, limit: 10 });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listInvoices = err(makeApiError("forbidden", "x"));
    expect(
      (await listInvoicesTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
