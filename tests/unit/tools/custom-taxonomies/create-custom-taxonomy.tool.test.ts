import { describe, expect, it } from "vitest";

import { createCustomTaxonomyTool } from "../../../../src/application/tools/custom-taxonomies/create-custom-taxonomy.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createCustomTaxonomyTool", () => {
  it("name + name length validation", () => {
    expect(createCustomTaxonomyTool.name).toBe("create_custom_taxonomy");
    expect(() => createCustomTaxonomyTool.inputSchema.parse({ name: "" })).toThrow();
    expect(() => createCustomTaxonomyTool.inputSchema.parse({ name: "x".repeat(101) })).toThrow();
  });

  it("forwards body with default empty description and empty nodes", async () => {
    const api = createFakeApiGateway();
    await createCustomTaxonomyTool.handler({ name: "Risk" }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "createCustomTaxonomy") throw new Error("wrong");
    expect(call.body.name).toBe("Risk");
    expect(call.body.description).toBe("");
    expect(call.body.nodes).toEqual([]);
  });

  it("normalises optional node fields (parent_client_id, description, is_default)", async () => {
    const api = createFakeApiGateway();
    await createCustomTaxonomyTool.handler(
      {
        name: "n",
        description: "d",
        nodes: [
          { client_id: "root", name: "Root", is_default: true },
          {
            client_id: "child",
            parent_client_id: "root",
            name: "Child",
            description: "leaf",
          },
        ],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCustomTaxonomy") throw new Error("wrong");
    expect(call.body.nodes).toEqual([
      {
        client_id: "root",
        parent_client_id: null,
        name: "Root",
        description: "",
        is_default: true,
      },
      {
        client_id: "child",
        parent_client_id: "root",
        name: "Child",
        description: "leaf",
        is_default: false,
      },
    ]);
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createCustomTaxonomy = err(makeApiError("invalid-input", "x"));
    expect(
      (await createCustomTaxonomyTool.handler({ name: "x" }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
