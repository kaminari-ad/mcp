/**
 * Pins the OAuth scope catalogue the Resource Server advertises.
 *
 * The list MUST stay byte-identical to the Authorization Server's
 * `advertised_scopes()` (== `sorted(KNOWN_SCOPES)` in
 * `api/src/app/oauth_authorization/domain/entities/scope.py`). The two
 * repos can't import each other, so the cross-repo contract is enforced
 * by both sides being the same lexicographically-sorted list. This test
 * locks the RS side: any edit to the catalogue must update this expected
 * array in the same change, and the sort/dedupe invariants guarantee the
 * AS-side `sorted()` derivation produces the identical sequence.
 */

import { describe, expect, it } from "vitest";

import { DEFAULT_OAUTH_SCOPES } from "../../../src/shared/oauth-scope-catalogue.js";

const EXPECTED_SCOPES: readonly string[] = [
  "mcp:account:read",
  "mcp:alert_notifications:read",
  "mcp:alert_notifications:write",
  "mcp:alerts:read",
  "mcp:alerts:write",
  "mcp:billing:read",
  "mcp:campaigns:read",
  "mcp:campaigns:write",
  "mcp:custom_rules:read",
  "mcp:custom_rules:write",
  "mcp:invoicing:read",
  "mcp:policies:read",
  "mcp:policies:write",
  "mcp:scans:read",
  "mcp:scans:write",
  "mcp:tags:read",
  "mcp:tags:write",
  "mcp:taxonomies:read",
  "mcp:taxonomies:write",
  "mcp:webhooks:read",
  "mcp:webhooks:write",
  "offline_access",
];

describe("DEFAULT_OAUTH_SCOPES", () => {
  it("matches the Authorization Server catalogue string-for-string", () => {
    expect([...DEFAULT_OAUTH_SCOPES]).toEqual(EXPECTED_SCOPES);
  });

  it("is lexicographically sorted (== AS advertised_scopes() ordering)", () => {
    const sorted = [...DEFAULT_OAUTH_SCOPES].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    expect([...DEFAULT_OAUTH_SCOPES]).toEqual(sorted);
  });

  it("contains no duplicates", () => {
    expect(new Set(DEFAULT_OAUTH_SCOPES).size).toBe(DEFAULT_OAUTH_SCOPES.length);
  });

  it("is frozen so callers cannot mutate the shared catalogue", () => {
    expect(Object.isFrozen(DEFAULT_OAUTH_SCOPES)).toBe(true);
  });

  it("places offline_access last and every mcp: scope before it", () => {
    expect(DEFAULT_OAUTH_SCOPES[DEFAULT_OAUTH_SCOPES.length - 1]).toBe("offline_access");
    const mcpScopes = DEFAULT_OAUTH_SCOPES.filter((s) => s.startsWith("mcp:"));
    expect(mcpScopes).toHaveLength(DEFAULT_OAUTH_SCOPES.length - 1);
  });
});
