import { describe, expect, it } from "vitest";

import { listTagsTool } from "../../../../src/application/tools/tags/list-tags.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listTagsTool", () => {
  it("name + accepts optional category and include_archived", () => {
    expect(listTagsTool.name).toBe("list_tags");
    expect(Object.keys(listTagsTool.inputSchema.shape)).toEqual(["category", "include_archived"]);
    expect(() => listTagsTool.inputSchema.parse({ category: "security" })).not.toThrow();
    expect(() => listTagsTool.inputSchema.parse({})).not.toThrow();
  });

  // Archived definitions still appear on the scans that carry them, so
  // an agent resolving a slug from an old scan needs to opt in.
  it("forwards include_archived when requested", async () => {
    const api = createFakeApiGateway();
    await listTagsTool.handler({ include_archived: true }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listTags") throw new Error("wrong");
    expect(call.filters).toEqual({ include_archived: true });
  });

  it("forwards category filter when provided", async () => {
    const api = createFakeApiGateway();
    await listTagsTool.handler({ category: "security" }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listTags") throw new Error("wrong");
    expect(call.filters).toEqual({ category: "security" });
  });

  it("calls listTags without filters and returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listTags = ok([
      {
        slug: "malware",
        category: "security",
        source: "system",
        display_name: "Malware",
        description: "",
        severity: "high",
        scope: "system",
        organization_id: null,
        visibility: "public",
        scans_count: 10,
        rules_count: 1,
      },
    ]);
    const ctx = makeToolContext({ api });
    const r = await listTagsTool.handler({}, ctx);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().total).toBe(1);
    expect(r._unsafeUnwrap().items[0]?.slug).toBe("malware");

    const call = api.state.calls[0];
    expect(call?.method).toBe("listTags");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listTags = err(makeApiError("forbidden", "x"));
    expect((await listTagsTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
