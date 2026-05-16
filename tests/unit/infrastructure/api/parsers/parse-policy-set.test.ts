import { describe, expect, it } from "vitest";

import {
  parsePolicySet,
  parsePolicySetList,
  parsePolicySetSummary,
} from "../../../../../src/infrastructure/api/parsers/parse-policy-set.js";

const VALID_SUMMARY = {
  id: "00000000-0000-0000-0000-000000000eee",
  name: "x",
  description: "d",
  visibility: "private",
  is_approved: true,
  created_at: "2026-01-01T00:00:00Z",
};

const VALID_FULL = { ...VALID_SUMMARY, entries: [{ tag_slug: "malware", country_codes: ["US"] }] };

describe("parsePolicySetSummary", () => {
  it("Ok valid", () => {
    expect(parsePolicySetSummary(VALID_SUMMARY).isOk()).toBe(true);
  });

  it("rejects non-object / no id", () => {
    expect(parsePolicySetSummary("x").isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID_SUMMARY;
    expect(parsePolicySetSummary(withoutId).isErr()).toBe(true);
  });

  it("defaults non-string description", () => {
    const r = parsePolicySetSummary({ ...VALID_SUMMARY, description: 5 });
    expect(r._unsafeUnwrap().description).toBe("");
  });
});

describe("parsePolicySet", () => {
  it("Ok valid full set", () => {
    expect(parsePolicySet(VALID_FULL).isOk()).toBe(true);
  });

  it("Ok when entries field is missing", () => {
    const r = parsePolicySet(VALID_SUMMARY);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().entries).toEqual([]);
  });

  it("rejects when an entry has wrong shape", () => {
    expect(parsePolicySet({ ...VALID_SUMMARY, entries: ["x"] }).isErr()).toBe(true);
    expect(
      parsePolicySet({ ...VALID_SUMMARY, entries: [{ tag_slug: 5 }] }).isErr()
    ).toBe(true);
  });

  it("filters non-string country_codes entries", () => {
    const r = parsePolicySet({
      ...VALID_SUMMARY,
      entries: [{ tag_slug: "x", country_codes: ["US", 1] }],
    });
    expect(r._unsafeUnwrap().entries[0]?.country_codes).toEqual(["US"]);
  });

  it("treats non-array country_codes as empty", () => {
    const r = parsePolicySet({
      ...VALID_SUMMARY,
      entries: [{ tag_slug: "x", country_codes: "x" }],
    });
    expect(r._unsafeUnwrap().entries[0]?.country_codes).toEqual([]);
  });

  it("rejects non-object / no id", () => {
    expect(parsePolicySet("x").isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID_FULL;
    expect(parsePolicySet(withoutId).isErr()).toBe(true);
  });
});

describe("parsePolicySetList", () => {
  it("Ok valid", () => {
    expect(parsePolicySetList([VALID_SUMMARY]).isOk()).toBe(true);
  });
  it("rejects non-array", () => {
    expect(parsePolicySetList({}).isErr()).toBe(true);
  });
  it("rejects when an item is malformed", () => {
    expect(parsePolicySetList([{}]).isErr()).toBe(true);
  });
});
