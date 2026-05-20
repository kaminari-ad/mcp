import { describe, expect, it } from "vitest";

import {
  parseCustomTaxonomy,
  parseCustomTaxonomyList,
  parseTaxonomyTextPreview,
} from "../../../../../src/infrastructure/api/parsers/parse-custom-taxonomy.js";

const TID = "00000000-0000-0000-0000-000000000aa1";
const NODE = {
  id: "00000000-0000-0000-0000-000000000bbb",
  parent_id: null,
  level: 1,
  position: 0,
  name: "Other",
  description: "fallback",
  is_default: true,
};
const TAXON = {
  id: TID,
  organization_id: "00000000-0000-0000-0000-000000000010",
  name: "Brand-safety",
  slug: "brand-safety",
  description: "",
  is_active: true,
  version: 2,
  nodes: [NODE],
  created_at: "2026-05-20T00:00:00Z",
  updated_at: "2026-05-20T00:00:00Z",
};

describe("parseCustomTaxonomyList", () => {
  it("Ok on bare array", () => {
    const r = parseCustomTaxonomyList([
      {
        id: TID,
        name: "Brand-safety",
        slug: "brand-safety",
        description: "",
        is_active: true,
        version: 2,
        node_count: 1,
        created_at: "2026-05-20T00:00:00Z",
        updated_at: "2026-05-20T00:00:00Z",
      },
    ]);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()[0]?.slug).toBe("brand-safety");
  });
  it("rejects envelope shape (api returns bare array)", () => {
    expect(parseCustomTaxonomyList({ items: [] }).isErr()).toBe(true);
  });
  it("rejects rows with non-uuid id", () => {
    expect(
      parseCustomTaxonomyList([
        {
          id: "nope",
          name: "x",
          slug: "x",
          description: "",
          is_active: true,
          version: 1,
          node_count: 0,
          created_at: "2026-05-20T00:00:00Z",
          updated_at: "2026-05-20T00:00:00Z",
        },
      ]).isErr()
    ).toBe(true);
  });
});

describe("parseCustomTaxonomy (single)", () => {
  it("Ok valid with nodes", () => {
    const r = parseCustomTaxonomy(TAXON);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().nodes).toHaveLength(1);
  });
  it("Ok with empty nodes", () => {
    expect(parseCustomTaxonomy({ ...TAXON, nodes: [] }).isOk()).toBe(true);
  });
  it("rejects on missing organization_id", () => {
    const { organization_id: _omit, ...rest } = TAXON;
    expect(parseCustomTaxonomy(rest).isErr()).toBe(true);
  });
  it("strips unknown fields on a node", () => {
    const r = parseCustomTaxonomy({
      ...TAXON,
      nodes: [{ ...NODE, mystery: "foo" }],
    });
    expect(r.isOk()).toBe(true);
    const node = r._unsafeUnwrap().nodes[0];
    expect((node as Record<string, unknown>)["mystery"]).toBeUndefined();
  });
});

describe("parseTaxonomyTextPreview", () => {
  it("Ok valid preview", () => {
    const r = parseTaxonomyTextPreview({
      nodes: [{ level: 1, name: "Root", description: "" }],
      warnings: ["repaired indent on line 3"],
    });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().warnings).toEqual(["repaired indent on line 3"]);
  });
  it("rejects when nodes / warnings keys are missing", () => {
    expect(parseTaxonomyTextPreview({}).isErr()).toBe(true);
  });
});
