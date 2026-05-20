import { describe, expect, it } from "vitest";

import { restoreCustomTaxonomyTool } from "../../../../src/application/tools/custom-taxonomies/restore-custom-taxonomy.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const TID = "00000000-0000-0000-0000-000000000aa1";

describe("restoreCustomTaxonomyTool", () => {
  it("name + idempotent + uuid validation", () => {
    expect(restoreCustomTaxonomyTool.name).toBe("restore_custom_taxonomy");
    expect(restoreCustomTaxonomyTool.annotations.idempotentHint).toBe(true);
    expect(() => restoreCustomTaxonomyTool.inputSchema.parse({ taxonomy_id: "nope" })).toThrow();
  });

  it("forwards id and returns full response", async () => {
    const api = createFakeApiGateway();
    await restoreCustomTaxonomyTool.handler({ taxonomy_id: TID }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "restoreCustomTaxonomy") throw new Error("wrong");
    expect(call.id).toBe(TID);
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.restoreCustomTaxonomy = err(makeApiError("not-found", "x"));
    expect(
      (
        await restoreCustomTaxonomyTool.handler({ taxonomy_id: TID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
