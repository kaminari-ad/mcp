import { describe, expect, it } from "vitest";

import { getBillingSummaryTool } from "../../../../src/application/tools/billing/get-billing-summary.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getBillingSummaryTool", () => {
  it("name", () => {
    expect(getBillingSummaryTool.name).toBe("get_billing_summary");
  });

  it("returns the summary", async () => {
    const api = createFakeApiGateway();
    const r = await getBillingSummaryTool.handler({}, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().billing_mode).toBe("prepaid");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getBillingSummary = err(makeApiError("forbidden", "x"));
    expect((await getBillingSummaryTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
