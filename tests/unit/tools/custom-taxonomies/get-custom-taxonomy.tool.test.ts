import { describe, expect, it } from "vitest";

import { getCustomTaxonomyTool } from "../../../../src/application/tools/custom-taxonomies/get-custom-taxonomy.tool.js";
import type { CustomTaxonomyResponse } from "../../../../src/domain/ports/api-gateway.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const ID = "00000000-0000-0000-0000-000000000aa1";

describe("getCustomTaxonomyTool", () => {
  it("name + uuid validation", () => {
    expect(getCustomTaxonomyTool.name).toBe("get_custom_taxonomy");
    expect(() => getCustomTaxonomyTool.inputSchema.parse({ taxonomy_id: "not-a-uuid" })).toThrow();
  });

  it("forwards id and surfaces parsed response fields on ok", async () => {
    const api = createFakeApiGateway();
    const fixture: CustomTaxonomyResponse = {
      id: ID,
      organization_id: "00000000-0000-0000-0000-000000000010",
      name: "Brand-safety",
      slug: "brand-safety",
      description: "",
      is_active: true,
      version: 3,
      nodes: [
        {
          id: "00000000-0000-0000-0000-000000000bbb",
          parent_id: null,
          level: 1,
          position: 0,
          name: "Other",
          description: "fallback",
          is_default: true,
        },
      ],
      created_at: "2026-05-20T00:00:00Z",
      updated_at: "2026-05-20T00:00:00Z",
    };
    api.state.responses.getCustomTaxonomy = ok<CustomTaxonomyResponse>(fixture);
    const result = await getCustomTaxonomyTool.handler(
      { taxonomy_id: ID },
      makeToolContext({ api })
    );
    expect(result.isOk()).toBe(true);
    const v = result._unsafeUnwrap();
    expect(v.id).toBe(ID);
    expect(v.version).toBe(3);
    expect(v.nodes).toHaveLength(1);
    expect(v.nodes[0]?.is_default).toBe(true);
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
