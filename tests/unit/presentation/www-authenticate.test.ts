/**
 * Unit tests for `buildBearerChallenge` — the pure WWW-Authenticate
 * value builder.
 *
 * The integration assertions live in `tests/isolation/www-authenticate.
 * test.ts`; this file pins the formatter's output shape so a refactor
 * that subtly changes quoting or parameter order surfaces here
 * without spinning up a server.
 */

import { describe, expect, it } from "vitest";

import { buildBearerChallenge } from "../../../src/presentation/http/www-authenticate.js";
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
    oauthScopes: ["mcp:scans:read", "offline_access"],
    ...overrides,
  };
}

describe("buildBearerChallenge", () => {
  it("emits a Bearer challenge with resource_metadata and scope parameters", () => {
    const value = buildBearerChallenge(baseConfig());
    expect(value).toBe(
      'Bearer resource_metadata="https://mcp.kaminari.ad/.well-known/oauth-protected-resource", scope="mcp:scans:read offline_access"'
    );
  });

  it("renders the configured metadata URL byte-for-byte (operators override per env)", () => {
    const value = buildBearerChallenge(
      baseConfig({
        oauthProtectedResourceMetadataUrl:
          "https://staging-mcp.kaminari.ad/.well-known/oauth-protected-resource",
      })
    );
    expect(value).toContain(
      'resource_metadata="https://staging-mcp.kaminari.ad/.well-known/oauth-protected-resource"'
    );
  });

  it("space-joins the scope list in advertisement order", () => {
    const value = buildBearerChallenge(baseConfig({ oauthScopes: ["a", "b", "c"] }));
    expect(value).toContain('scope="a b c"');
  });

  it("renders empty scopes as empty quoted parameter (operator misconfig is visible, not silent)", () => {
    const value = buildBearerChallenge(baseConfig({ oauthScopes: [] }));
    expect(value).toContain('scope=""');
  });
});
