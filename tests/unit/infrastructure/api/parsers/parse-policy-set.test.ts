/**
 * Schema-based tests for `parsePolicySet` / `parsePolicySetList`.
 * The list parser unwraps both bare-array and `{ items: [...] }`
 * envelope shapes (same `parseArrayOrItemsWithSchema` pattern as
 * `parseCustomRuleArray` / `parseCampaignGroupArray`).
 */

import { describe, expect, it } from "vitest";

import {
  parsePolicySet,
  parsePolicySetList,
} from "../../../../../src/infrastructure/api/parsers/parse-policy-set.js";

const VALID = {
  id: "00000000-0000-0000-0000-000000000eee",
  organization_id: "00000000-0000-0000-0000-000000000010",
  name: "policy",
  description: "test",
  visibility: "private",
  is_approved: false,
  entries: [
    {
      id: "00000000-0000-0000-0000-000000000999",
      tag_slug: "malware",
      country_codes: ["US", "DE"],
    },
  ],
  created_at: "2026-05-17T00:00:00Z",
};

describe("parsePolicySet", () => {
  it("Ok valid", () => {
    expect(parsePolicySet(VALID).isOk()).toBe(true);
  });
  it("rejects on missing required field", () => {
    const { id: _omit, ...withoutId } = VALID;
    expect(parsePolicySet(withoutId).isErr()).toBe(true);
  });
  it("rejects non-object", () => {
    expect(parsePolicySet("x").isErr()).toBe(true);
  });
});

describe("parsePolicySetList", () => {
  it("Ok bare array", () => {
    expect(parsePolicySetList([VALID]).isOk()).toBe(true);
  });
  it("Ok paginated envelope", () => {
    expect(
      parsePolicySetList({ items: [VALID], total: 1, page: 1, limit: 50, pages: 1 }).isOk()
    ).toBe(true);
  });
  it("Ok empty envelope", () => {
    expect(parsePolicySetList({ items: [], total: 0, page: 1, limit: 50, pages: 0 }).isOk()).toBe(
      true
    );
  });
  it("rejects garbage shape", () => {
    expect(parsePolicySetList({}).isErr()).toBe(true);
    expect(parsePolicySetList(42).isErr()).toBe(true);
    expect(parsePolicySetList({ items: "not-array" }).isErr()).toBe(true);
  });
  it("rejects when an item is malformed", () => {
    expect(parsePolicySetList([{ id: "not-uuid" }]).isErr()).toBe(true);
  });
});
