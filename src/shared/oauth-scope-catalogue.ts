/**
 * Canonical catalogue of OAuth 2.0 scopes the Kaminari Ad MCP server
 * advertises in its protected-resource metadata (RFC 9728) and
 * `WWW-Authenticate: Bearer scope="..."` challenge.
 *
 * The catalogue is intentionally static and lives in `shared/` because
 * (a) it has no runtime behaviour — it is data — and (b) it is read by
 * both the `protected-resource-metadata-handler` and the
 * `www-authenticate` builder. If a new scope is added on the
 * Authorization Server side, mirror it here in the same release so the
 * Resource Server (this process) advertises it.
 *
 * `offline_access` is part of the catalogue per RFC 6749 §6 because
 * the Authorization Server issues refresh tokens only when the client
 * requests this scope. Anthropic's Claude clients append it
 * automatically when the server advertises it in
 * `scopes_supported`/the `WWW-Authenticate` `scope=` parameter.
 */

/**
 * Default scope catalogue, frozen at build time. The order is the
 * canonical advertisement order (read-before-write per resource, then
 * `offline_access` last).
 */
export const DEFAULT_OAUTH_SCOPES: readonly string[] = Object.freeze([
  "mcp:scans:read",
  "mcp:scans:write",
  "mcp:campaigns:read",
  "mcp:campaigns:write",
  "mcp:billing:read",
  "mcp:webhooks:write",
  "offline_access",
]);
