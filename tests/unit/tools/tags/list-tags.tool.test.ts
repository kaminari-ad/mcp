import { describe, expect, it } from "vitest";

import { listTagsTool } from "../../../../src/application/tools/tags/list-tags.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listTagsTool", () => {
  it("name + zero-arg input", () => {
    expect(listTagsTool.name).toBe("list_tags");
    expect(Object.keys(listTagsTool.inputSchema.shape)).toEqual([]);
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
        is_system: true,
        organization_id: null,
        show_in_public_report: true,
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
