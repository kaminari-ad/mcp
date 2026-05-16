import { describe, expect, it } from "vitest";

import {
  parsePolicySet,
  parsePolicySetList,
} from "../../../../../src/infrastructure/api/parsers/parse-policy-set.js";

const VALID_BASE = {
  id: "00000000-0000-0000-0000-000000000eee",
  organization_id: "00000000-0000-0000-0000-000000000010",
  name: "x",
  description: "d",
  visibility: "private",
  is_approved: true,
  created_at: "2026-01-01T00:00:00Z",
};

const VALID_ENTRY = {
  id: "00000000-0000-0000-0000-000000000999",
  tag_slug: "malware",
  country_codes: ["US"],
};

const VALID_FULL = { ...VALID_BASE, entries: [VALID_ENTRY] };

describe("parsePolicySet", () => {
  it("Ok valid full set", () => {
    expect(parsePolicySet(VALID_FULL).isOk()).toBe(true);
  });
  it("Ok when entries field is missing", () => {
    const r = parsePolicySet(VALID_BASE);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().entries).toEqual([]);
  });
  it("rejects when an entry has wrong shape", () => {
    expect(parsePolicySet({ ...VALID_BASE, entries: ["x"] }).isErr()).toBe(true);
    expect(parsePolicySet({ ...VALID_BASE, entries: [{ id: "e1", tag_slug: 5 }] }).isErr()).toBe(
      true
    );
  });
  it("filters non-string country_codes entries", () => {
    const r = parsePolicySet({
      ...VALID_BASE,
      entries: [{ id: "e1", tag_slug: "x", country_codes: ["US", 1] }],
    });
    expect(r._unsafeUnwrap().entries[0]?.country_codes).toEqual(["US"]);
  });
  it("treats non-array country_codes as empty", () => {
    const r = parsePolicySet({
      ...VALID_BASE,
      entries: [{ id: "e1", tag_slug: "x", country_codes: "x" }],
    });
    expect(r._unsafeUnwrap().entries[0]?.country_codes).toEqual([]);
  });
  it("rejects non-object / no id / no organization_id", () => {
    expect(parsePolicySet("x").isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID_FULL;
    expect(parsePolicySet(withoutId).isErr()).toBe(true);
    const { organization_id: _omitOrg, ...withoutOrg } = VALID_FULL;
    expect(parsePolicySet(withoutOrg).isErr()).toBe(true);
  });
  it("defaults non-string description", () => {
    const r = parsePolicySet({ ...VALID_BASE, description: 5 });
    expect(r._unsafeUnwrap().description).toBe("");
  });
});

describe("parsePolicySetList", () => {
  it("Ok valid", () => {
    expect(parsePolicySetList([VALID_FULL]).isOk()).toBe(true);
  });
  it("rejects non-array", () => {
    expect(parsePolicySetList({}).isErr()).toBe(true);
  });
  it("rejects when an item is malformed", () => {
    expect(parsePolicySetList([{}]).isErr()).toBe(true);
  });
});
