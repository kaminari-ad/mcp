import { describe, expect, it } from "vitest";

import { cancelScanTool } from "../../../../src/application/tools/scans/cancel-scan.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("cancelScanTool", () => {
  it("has canonical name and validates UUID", () => {
    expect(cancelScanTool.name).toBe("cancel_scan");
    expect(() => cancelScanTool.inputSchema.parse({ scan_id: "abc" })).toThrow();
  });

  it("returns the count and forwards scan_id", async () => {
    const api = createFakeApiGateway();
    api.state.responses.cancelScan = ok({ cancelled_count: 1 });
    const ctx = makeToolContext({ api });
    const result = await cancelScanTool.handler(
      { scan_id: "00000000-0000-0000-0000-000000000aaa" },
      ctx
    );
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({ cancelled_count: 1 });
    const call = api.state.calls[0];
    expect(call).toEqual({
      method: "cancelScan",
      scanId: "00000000-0000-0000-0000-000000000aaa",
    });
  });

  it("maps ApiError to ToolError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.cancelScan = err(makeApiError("forbidden", "no access"));
    const ctx = makeToolContext({ api });
    const result = await cancelScanTool.handler(
      { scan_id: "00000000-0000-0000-0000-000000000aaa" },
      ctx
    );
    expect(result.isErr()).toBe(true);
  });
});
