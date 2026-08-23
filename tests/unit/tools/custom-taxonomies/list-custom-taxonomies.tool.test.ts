import { describe, expect, it } from "vitest";

import { listCustomTaxonomiesTool } from "../../../../src/application/tools/custom-taxonomies/list-custom-taxonomies.tool.js";
import type { CustomTaxonomyListItem } from "../../../../src/domain/ports/api-gateway.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const ITEM: CustomTaxonomyListItem = {
  id: "00000000-0000-0000-0000-000000000aa1",
  name: "Brand-safety risk",
  slug: "brand-safety-risk",
  description: "",
  is_active: true,
  version: 2,
  node_count: 12,
  created_at: "2026-05-20T00:00:00Z",
  updated_at: "2026-05-20T00:00:00Z",
};

describe("listCustomTaxonomiesTool", () => {
  it("name + readonly hints", () => {
    expect(listCustomTaxonomiesTool.name).toBe("list_custom_taxonomies");
    expect(listCustomTaxonomiesTool.annotations.readOnlyHint).toBe(true);
    expect(listCustomTaxonomiesTool.annotations.idempotentHint).toBe(true);
  });

  it("returns wrapped items array on success", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCustomTaxonomies = ok<readonly CustomTaxonomyListItem[]>([ITEM]);
    const result = await listCustomTaxonomiesTool.handler({}, makeToolContext({ api }));
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().items).toEqual([ITEM]);
  });

  it("calls listCustomTaxonomies once with no filters", async () => {
    const api = createFakeApiGateway();
    await listCustomTaxonomiesTool.handler({}, makeToolContext({ api }));
    expect(api.state.calls).toEqual([{ method: "listCustomTaxonomies", filters: {} }]);
  });

  // Inactive taxonomies are excluded by default, so an agent looking
  // for one to `restore_custom_taxonomy` has to opt in. The tool used
  // to claim they were always listed.
  it("forwards include_inactive when requested", async () => {
    const api = createFakeApiGateway();
    await listCustomTaxonomiesTool.handler({ include_inactive: true }, makeToolContext({ api }));
    expect(api.state.calls).toEqual([
      { method: "listCustomTaxonomies", filters: { include_inactive: true } },
    ]);
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCustomTaxonomies = err(makeApiError("upstream", "boom"));
    const result = await listCustomTaxonomiesTool.handler({}, makeToolContext({ api }));
    expect(result.isErr()).toBe(true);
  });
});
