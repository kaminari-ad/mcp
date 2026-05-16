import { describe, expect, it } from "vitest";

import { recheckScansTool } from "../../../../src/application/tools/scans/recheck-scans.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("recheckScansTool", () => {
  it("has canonical name and enum validation", () => {
    expect(recheckScansTool.name).toBe("recheck_scans");
    expect(() => recheckScansTool.inputSchema.parse({ scope_type: "weeks", scope_value: 1 })).toThrow();
  });

  it("forwards scope verbatim and returns queued_count", async () => {
    const api = createFakeApiGateway();
    api.state.responses.recheckScans = ok({ queued_count: 42 });
    const ctx = makeToolContext({ api });
    const result = await recheckScansTool.handler({ scope_type: "hours", scope_value: 4 }, ctx);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({ queued_count: 42 });
    const call = api.state.calls[0];
    expect(call).toEqual({
      method: "recheckScans",
      body: { scope_type: "hours", scope_value: 4 },
    });
  });

  it("maps ApiError to ToolError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.recheckScans = err(makeApiError("rate-limited", "later"));
    const ctx = makeToolContext({ api });
    const result = await recheckScansTool.handler({ scope_type: "last_n", scope_value: 10 }, ctx);
    expect(result.isErr()).toBe(true);
  });
});
