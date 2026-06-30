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

import type { ServerResponse } from "node:http";

import { describe, expect, it, vi } from "vitest";

import {
  buildProtectedResourceMetadata,
  respondWithProtectedResourceMetadata,
} from "../../../src/presentation/http/protected-resource-metadata-handler.js";
import type { Config } from "../../../src/shared/config.js";

function baseConfig(overrides: Partial<Config> = {}): Config {
  return {
    transport: "http",
    apiBaseUrl: "https://app.kaminari.ad",
    logLevel: "info",
    logFormat: "json",
    httpPort: 8080,
    rateLimitRpm: 120,
    stdioApiKey: undefined,
    oauthProtectedResource: "https://mcp.kaminari.ad/mcp",
    oauthProtectedResourceMetadataUrl:
      "https://mcp.kaminari.ad/.well-known/oauth-protected-resource",
    oauthAuthorizationServerUrl: "https://app.kaminari.ad",
    oauthScopes: [
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

describe("respondWithProtectedResourceMetadata", () => {
  it("writes 200 + JSON body + 1h public Cache-Control", () => {
    const writeHead = vi.fn();
    const end = vi.fn();
    const res = { writeHead, end } as unknown as ServerResponse;

    respondWithProtectedResourceMetadata(res, baseConfig());

    expect(writeHead).toHaveBeenCalledWith(200, {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600",
    });
    expect(end).toHaveBeenCalledOnce();
    const written = end.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(written) as Readonly<Record<string, unknown>>;
    expect(parsed["resource"]).toBe("https://mcp.kaminari.ad/mcp");
    expect(parsed["bearer_methods_supported"]).toEqual(["header"]);
  });
});
