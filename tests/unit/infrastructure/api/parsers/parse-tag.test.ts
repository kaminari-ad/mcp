import { describe, expect, it } from "vitest";

import {
  parseTag,
  parseTagDefinitionArray,
  parseTagDetail,
} from "../../../../../src/infrastructure/api/parsers/parse-tag.js";

const TAG_ROW = {
  slug: "malware",
  category: "security",
  source: "system",
  display_name: "Malware",
  description: "Tag for malware redirects.",
  severity: "high",
  scope: "system",
  organization_id: null,
  visibility: "public",
  scans_count: 42,
  rules_count: 3,
};

describe("parseTag (list-row schema)", () => {
  it("Ok on per-row payload", () => {
    expect(parseTag(TAG_ROW).isOk()).toBe(true);
  });

  it("rejects wrong type for required field", () => {
    expect(parseTag({ ...TAG_ROW, slug: 42 }).isErr()).toBe(true);
  });
});

describe("parseTagDefinitionArray (list endpoint)", () => {
  it("Ok on bare array", () => {
    expect(parseTagDefinitionArray([TAG_ROW, TAG_ROW]).isOk()).toBe(true);
  });

  it("rejects envelope shape", () => {
    expect(parseTagDefinitionArray({ items: [TAG_ROW] }).isErr()).toBe(true);
  });
});

describe("parseTagDetail (detail endpoint with linked_rules)", () => {
  it("Ok on payload with populated linked_rules", () => {
    const r = parseTagDetail({
      ...TAG_ROW,
      linked_rules: [
        { id: "00000000-0000-0000-0000-000000000abc", name: "ad-detector", is_active: true },
        { id: "00000000-0000-0000-0000-000000000def", name: "old-rule", is_active: false },
      ],
    });
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.linked_rules).toHaveLength(2);
    expect(v.linked_rules?.[0]?.name).toBe("ad-detector");
    expect(v.linked_rules?.[0]?.is_active).toBe(true);
  });

  it("Ok on payload with empty linked_rules", () => {
    const r = parseTagDetail({ ...TAG_ROW, linked_rules: [] });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().linked_rules).toEqual([]);
  });

  it("Ok when linked_rules key is absent (older API)", () => {
    const r = parseTagDetail(TAG_ROW);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().linked_rules).toBeUndefined();
  });

  it("strips extra fields on linked rules (rule_type, target — agents fetch via get_custom_rule)", () => {
    const r = parseTagDetail({
      ...TAG_ROW,
      linked_rules: [
        {
          id: "00000000-0000-0000-0000-000000000abc",
          name: "n",
          is_active: true,
          rule_type: "regex",
          target: "page",
        },
      ],
    });
    expect(r.isOk()).toBe(true);
    const lr = r._unsafeUnwrap().linked_rules?.[0];
    expect(lr).toBeDefined();
    expect((lr as Record<string, unknown>)["rule_type"]).toBeUndefined();
  });

  it("rejects linked rule with non-uuid id", () => {
    const r = parseTagDetail({
      ...TAG_ROW,
      linked_rules: [{ id: "nope", name: "n", is_active: true }],
    });
    expect(r.isErr()).toBe(true);
  });
});
