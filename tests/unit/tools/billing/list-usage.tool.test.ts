import { describe, expect, it } from "vitest";

import { listUsageTool } from "../../../../src/application/tools/billing/list-usage.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000aaa";

describe("listUsageTool", () => {
  it("name + read-only", () => {
    expect(listUsageTool.name).toBe("list_usage");
    expect(listUsageTool.annotations.readOnlyHint).toBe(true);
  });
  it("forwards all optional filters (with ISO 8601 datetime bounds)", async () => {
    const api = createFakeApiGateway();
    await listUsageTool.handler(
      {
        date_from: "2026-01-01T00:00:00Z",
        date_to: "2026-02-01T23:59:59Z",
        scan_id: SID,
        page: 1,
        limit: 50,
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listUsage") throw new Error("wrong");
    expect(call.filters.date_from).toBe("2026-01-01T00:00:00Z");
    expect(call.filters.scan_id).toBe(SID);
  });

  it("rejects plain ISO date in date_from (datetime is required after P3)", () => {
    expect(() =>
      listUsageTool.inputSchema.parse({ date_from: "2026-01-01", page: 1, limit: 50 })
    ).toThrow();
  });
  it("omits optional filters when undefined", async () => {
    const api = createFakeApiGateway();
    await listUsageTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listUsage") throw new Error("wrong");
    expect(call.filters.scan_id).toBeUndefined();
    expect(call.filters.date_from).toBeUndefined();
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listUsage = err(makeApiError("forbidden", "x"));
    expect(
      (await listUsageTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
