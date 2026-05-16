import { describe, expect, it } from "vitest";
import { cancelRunTool } from "../../../../src/application/tools/runs/cancel-run.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000222";

describe("cancelRunTool", () => {
  it("name", () => {
    expect(cancelRunTool.name).toBe("cancel_run");
  });
  it("returns affected_count", async () => {
    const api = createFakeApiGateway();
    const r = await cancelRunTool.handler({ run_id: RID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().affected_count).toBe(0);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.cancelRun = err(makeApiError("not-found", "x"));
    expect((await cancelRunTool.handler({ run_id: RID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
