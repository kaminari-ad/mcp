import { describe, expect, it } from "vitest";

import { getScanTool } from "../../../../src/application/tools/scans/get-scan.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getScanTool", () => {
  it("has canonical name and requires a UUID scan_id", () => {
    expect(getScanTool.name).toBe("get_scan");
    expect(() => getScanTool.inputSchema.parse({ scan_id: "not-a-uuid" })).toThrow();
    expect(() =>
      getScanTool.inputSchema.parse({ scan_id: "00000000-0000-0000-0000-000000000aaa" })
    ).not.toThrow();
  });

  it("forwards scan_id to the gateway and returns the scan", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const result = await getScanTool.handler(
      { scan_id: "00000000-0000-0000-0000-000000000aaa" },
      ctx
    );
    expect(result.isOk()).toBe(true);
    const call = api.state.calls[0];
    expect(call).toEqual({
      method: "getScan",
      scanId: "00000000-0000-0000-0000-000000000aaa",
    });
  });

  it("maps a 404 ApiError to ToolError not-found", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScan = err(makeApiError("not-found", "Scan not found"));
    const ctx = makeToolContext({ api });
    const result = await getScanTool.handler(
      { scan_id: "00000000-0000-0000-0000-000000000aaa" },
      ctx
    );
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ kind: "not-found", message: "Scan not found" });
  });
});
