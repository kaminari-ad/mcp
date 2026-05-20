/**
 * Unit tests for the RFC 9728 protected-resource metadata builder.
 *
 * Pins the JSON shape — Anthropic's Claude clients fetch this document
 * to discover the Authorization Server and the canonical resource
 * identifier, so a silent shape drift breaks every existing directory
 * connection. The isolation test in `tests/isolation/oauth-discovery.
 * test.ts` covers the wire-level behaviour; this one is the cheaper
 * lockfile.
 */

import { describe, expect, it } from "vitest";

import { buildProtectedResourceMetadata } from "../../../src/presentation/http/protected-resource-metadata-handler.js";
import type { Config } from "../../../src/shared/config.js";

function baseConfig(overrides: Partial<Config> = {}): Config {
  return {
    transport: "http",
    apiBaseUrl: "https://app.kaminari.ad",
    logLevel: "info",
    logFormat: "json",
    httpPort: 8080,
    sessionTtlSec: 1800,
    rateLimitRpm: 120,
    stdioApiKey: undefined,
    oauthProtectedResource: "https://mcp.kaminari.ad/mcp",
    oauthProtectedResourceMetadataUrl:
      "https://mcp.kaminari.ad/.well-known/oauth-protected-resource",
    oauthAuthorizationServerUrl: "https://app.kaminari.ad",
    oauthScopes: [
      "mcp:scans:read",
      "mcp:scans:write",
      "mcp:campaigns:read",
      "mcp:campaigns:write",
      "mcp:billing:read",
      "mcp:webhooks:write",
      "offline_access",
    ],
    ...overrides,
  };
}

describe("buildProtectedResourceMetadata", () => {
  it("emits the canonical RFC 9728 shape with default scopes", () => {
    const body = buildProtectedResourceMetadata(baseConfig());
    expect(body).toEqual({
      resource: "https://mcp.kaminari.ad/mcp",
      authorization_servers: ["https://app.kaminari.ad"],
      scopes_supported: [
        "mcp:scans:read",
        "mcp:scans:write",
        "mcp:campaigns:read",
        "mcp:campaigns:write",
        "mcp:billing:read",
        "mcp:webhooks:write",
        "offline_access",
      ],
      bearer_methods_supported: ["header"],
    });
  });

  it("wraps the single authorization server URL in an array (Claude reads index 0 only)", () => {
    const body = buildProtectedResourceMetadata(
      baseConfig({ oauthAuthorizationServerUrl: "https://idp.example" })
    );
    expect(body["authorization_servers"]).toEqual(["https://idp.example"]);
  });

  it("copies the scope catalogue without mutating it (caller gets a fresh array)", () => {
    const scopes = ["mcp:scans:read"];
    const body = buildProtectedResourceMetadata(baseConfig({ oauthScopes: scopes }));
    expect(body["scopes_supported"]).toEqual(scopes);
    expect(body["scopes_supported"]).not.toBe(scopes);
  });
});
