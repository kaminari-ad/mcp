import { describe, expect, it } from "vitest";

import { listTagsTool } from "../../../../src/application/tools/tags/list-tags.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listTagsTool", () => {
  it("name + defaults", () => {
    expect(listTagsTool.name).toBe("list_tags");
    expect(listTagsTool.inputSchema.parse({}).limit).toBe(50);
  });

  it("forwards category filter when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listTagsTool.handler({ category: "malware", page: 1, limit: 50 }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "listTags") throw new Error("wrong");
    expect(call.filters.category).toBe("malware");
  });

  it("omits category when undefined", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listTagsTool.handler({ page: 1, limit: 50 }, ctx);
    const call = api.state.calls[0];
    if (call?.method !== "listTags") throw new Error("wrong");
    expect(call.filters.category).toBeUndefined();
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listTags = err(makeApiError("forbidden", "x"));
    expect(
      (await listTagsTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
