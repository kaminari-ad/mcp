import { describe, expect, it } from "vitest";

import { listRunsTool } from "../../../../src/application/tools/runs/list-runs.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listRunsTool", () => {
  it("name + defaults", () => {
    expect(listRunsTool.name).toBe("list_runs");
    expect(listRunsTool.inputSchema.parse({}).page).toBe(1);
  });

  it("forwards campaign_id when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listRunsTool.handler(
      { page: 1, limit: 50, campaign_id: "00000000-0000-0000-0000-000000000ccc" },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "listRuns") throw new Error("wrong");
    expect(call.filters.campaign_id).toBe("00000000-0000-0000-0000-000000000ccc");
  });

  it("omits campaign_id when not supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listRunsTool.handler({ page: 1, limit: 50 }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "listRuns") throw new Error("wrong");
    expect(call.filters.campaign_id).toBeUndefined();
  });

  it("maps ApiError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listRuns = err(makeApiError("forbidden", "x"));
    const ctx = makeToolContext({ api });
    expect((await listRunsTool.handler({ page: 1, limit: 50 }, ctx)).isErr()).toBe(true);
  });
});
