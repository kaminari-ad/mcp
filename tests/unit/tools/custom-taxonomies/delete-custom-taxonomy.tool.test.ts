import { describe, expect, it } from "vitest";

import { deleteCustomTaxonomyTool } from "../../../../src/application/tools/custom-taxonomies/delete-custom-taxonomy.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const TID = "00000000-0000-0000-0000-000000000aa1";

describe("deleteCustomTaxonomyTool", () => {
  it("name + destructive hint + uuid validation", () => {
    expect(deleteCustomTaxonomyTool.name).toBe("delete_custom_taxonomy");
    expect(deleteCustomTaxonomyTool.annotations.destructiveHint).toBe(true);
    expect(() => deleteCustomTaxonomyTool.inputSchema.parse({ taxonomy_id: "nope" })).toThrow();
  });

  it("returns deleted=true on ok", async () => {
    const api = createFakeApiGateway();
    const r = await deleteCustomTaxonomyTool.handler(
      { taxonomy_id: TID },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap()).toEqual({ deleted: true });
    const call = api.state.calls[0];
    if (call?.method !== "deleteCustomTaxonomy") throw new Error("wrong");
    expect(call.id).toBe(TID);
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.deleteCustomTaxonomy = err(makeApiError("not-found", "x"));
    expect(
      (
        await deleteCustomTaxonomyTool.handler({ taxonomy_id: TID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
