import { describe, expect, it } from "vitest";

import { updateCustomTaxonomyTool } from "../../../../src/application/tools/custom-taxonomies/update-custom-taxonomy.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const TID = "00000000-0000-0000-0000-000000000aa1";

describe("updateCustomTaxonomyTool", () => {
  it("name + uuid + name required", () => {
    expect(updateCustomTaxonomyTool.name).toBe("update_custom_taxonomy");
    expect(() =>
      updateCustomTaxonomyTool.inputSchema.parse({ taxonomy_id: "nope", name: "n" })
    ).toThrow();
    expect(() => updateCustomTaxonomyTool.inputSchema.parse({ taxonomy_id: TID })).toThrow();
  });

  it("forwards id, body and normalises optional fields", async () => {
    const api = createFakeApiGateway();
    await updateCustomTaxonomyTool.handler(
      {
        taxonomy_id: TID,
        name: "Renamed",
        nodes: [{ client_id: "r", name: "Root" }],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateCustomTaxonomy") throw new Error("wrong");
    expect(call.id).toBe(TID);
    expect(call.body.name).toBe("Renamed");
    expect(call.body.description).toBe("");
    expect(call.body.nodes[0]).toEqual({
      client_id: "r",
      parent_client_id: null,
      name: "Root",
      description: "",
      is_default: false,
    });
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateCustomTaxonomy = err(makeApiError("not-found", "x"));
    expect(
      (
        await updateCustomTaxonomyTool.handler(
          { taxonomy_id: TID, name: "n" },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
