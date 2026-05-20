/**
 * Handler for `GET /.well-known/oauth-protected-resource` — the
 * RFC 9728 protected-resource metadata document.
 *
 * Anthropic's Claude directory clients fetch this document to discover
 * (a) the Authorization Server that issues tokens for this resource
 * and (b) the canonical resource identifier they should pass as the
 * `aud` claim / `resource` parameter. The document is **public,
 * static, contains no tenant data**, and is served without any
 * Authorization check — the same pattern as `/healthz` per
 * `mcp-tenant-isolation.mdc` rule §16.
 *
 * Body shape is locked by a golden-file test (`tests/isolation/
 * oauth-discovery.test.ts`) so a refactor cannot silently break Claude
 * discovery — the spec's `2025-11-25` revision is the contract.
 */

import type { ServerResponse } from "node:http";

import type { Config } from "../../shared/config.js";

/**
 * Build the JSON body of the protected-resource metadata document.
 *
 * Pure function — no `ServerResponse` dependency — so the document
 * shape can be byte-stably asserted in unit tests without spinning
 * up a server.
 */
export function buildProtectedResourceMetadata(config: Config): Readonly<Record<string, unknown>> {
  return {
    resource: config.oauthProtectedResource,
    authorization_servers: [config.oauthAuthorizationServerUrl],
    scopes_supported: [...config.oauthScopes],
    bearer_methods_supported: ["header"],
  };
}

/**
 * Write the metadata document as a `200 OK` JSON response. Sets
 * `Cache-Control: public, max-age=3600` so well-behaved clients
 * (Anthropic edges, CDNs) don't hammer the endpoint, but keep the
 * staleness window short so a scope-catalogue update propagates
 * within an hour.
 */
export function respondWithProtectedResourceMetadata(res: ServerResponse, config: Config): void {
  const body = buildProtectedResourceMetadata(config);
  res.writeHead(200, {
    "content-type": "application/json",
    "cache-control": "public, max-age=3600",
  });
  res.end(JSON.stringify(body));
}
