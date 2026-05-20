import { describe, expect, it } from "vitest";

import { getCustomTaxonomyTool } from "../../../../src/application/tools/custom-taxonomies/get-custom-taxonomy.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const ID = "00000000-0000-0000-0000-000000000aa1";

describe("getCustomTaxonomyTool", () => {
  it("name + uuid validation", () => {
    expect(getCustomTaxonomyTool.name).toBe("get_custom_taxonomy");
    expect(() => getCustomTaxonomyTool.inputSchema.parse({ taxonomy_id: "not-a-uuid" })).toThrow();
  });

  it("forwards id and returns full response on ok", async () => {
    const api = createFakeApiGateway();
    const result = await getCustomTaxonomyTool.handler(
      { taxonomy_id: ID },
      makeToolContext({ api })
    );
    expect(result.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "getCustomTaxonomy") throw new Error("wrong method");
    expect(call.id).toBe(ID);
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getCustomTaxonomy = err(makeApiError("not-found", "x"));
    expect(
      (await getCustomTaxonomyTool.handler({ taxonomy_id: ID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
