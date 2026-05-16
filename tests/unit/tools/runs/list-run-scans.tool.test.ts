import { describe, expect, it } from "vitest";
import { listRunScansTool } from "../../../../src/application/tools/runs/list-run-scans.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000222";

describe("listRunScansTool", () => {
  it("name + read-only", () => {
    expect(listRunScansTool.name).toBe("list_run_scans");
    expect(listRunScansTool.annotations.readOnlyHint).toBe(true);
  });
  it("forwards pagination + run id", async () => {
    const api = createFakeApiGateway();
    await listRunScansTool.handler({ run_id: RID, page: 2, limit: 10 }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listRunScans") throw new Error("wrong");
    expect(call.runId).toBe(RID);
    expect(call.filters).toEqual({ page: 2, limit: 10 });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listRunScans = err(makeApiError("not-found", "x"));
    expect((await listRunScansTool.handler({ run_id: RID, page: 1, limit: 50 }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
