/**
 * Schema-based tests for `parsePolicySet` (single-entity detail).
 * List endpoint coverage lives in `parse-policy-set-page.test.ts` —
 * the per-page parser replaced the legacy bare-or-envelope
 * `parsePolicySetList` helper in v0.2.0.
 */

import { describe, expect, it } from "vitest";

import { parsePolicySet } from "../../../../../src/infrastructure/api/parsers/parse-policy-set.js";

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
      rule_type: "tag",
      tag_slug: "malware",
      iab_v3: null,
      brand: null,
      ai_category: null,
      custom_taxonomy: null,
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
  it("preserves entries in the detail payload (unlike the slim list item)", () => {
    const r = parsePolicySet(VALID);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().entries).toHaveLength(1);
  });
});
