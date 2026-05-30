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
 * Default scope catalogue, frozen at build time.
 *
 * MUST stay byte-identical to the Authorization Server's advertised
 * catalogue (`app.oauth_authorization.domain.entities.scope.advertised_scopes()`
 * — i.e. `sorted(KNOWN_SCOPES)`). The order is lexicographic, which
 * happens to yield the desired semantics for free: `:read` sorts before
 * `:write` within a resource, and `offline_access` sorts after every
 * `mcp:` scope.
 *
 * Read scopes grant the resource's view permission; write scopes grant
 * read + the resource's mutating permissions. billing/invoicing/account
 * are read-only over OAuth by design (money-spend / privilege-escalation
 * tools stay API-key only). When the AS catalogue changes, mirror it
 * here in the same release — `tests/unit/shared/oauth-scope-catalogue.test.ts`
 * pins the exact list so drift fails CI.
 */
export const DEFAULT_OAUTH_SCOPES: readonly string[] = Object.freeze([
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
]);
