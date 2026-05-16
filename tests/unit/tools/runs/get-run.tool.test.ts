import { describe, expect, it } from "vitest";

import { getRunTool } from "../../../../src/application/tools/runs/get-run.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000222";

describe("getRunTool", () => {
  it("name + uuid validation", () => {
    expect(getRunTool.name).toBe("get_run");
    expect(() => getRunTool.inputSchema.parse({ run_id: "x" })).toThrow();
  });

  it("forwards id and returns run", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const r = await getRunTool.handler({ run_id: RID }, ctx);
    expect(r.isOk()).toBe(true);
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getRun = err(makeApiError("not-found", "x"));
    const ctx = makeToolContext({ api });
    expect((await getRunTool.handler({ run_id: RID }, ctx)).isErr()).toBe(true);
  });
});
