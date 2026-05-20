/**
 * Pure builder for the `WWW-Authenticate: Bearer …` challenge that the
 * Resource Server returns on 401 responses.
 *
 * Follows RFC 6750 §3 for the `Bearer` scheme and the MCP authorization
 * spec's `resource_metadata` extension (advertised in the Anthropic
 * Claude directory docs) which points clients at our RFC 9728
 * protected-resource metadata document.
 *
 * Kept in its own file so callers don't drag the formatting concerns
 * into request-handler hot paths, and so `http-request-handler.ts`
 * stays under the 200-line effective limit (see `mcp-clean-code.mdc`
 * → File Size).
 */

import type { Config } from "../../shared/config.js";

/**
 * Build the value of the `WWW-Authenticate` header for an unauthorized
 * MCP request. Includes the metadata-URL pointer Claude needs to
 * discover our Authorization Server, plus the space-delimited list of
 * scopes the operator has configured.
 *
 * Empty `oauthScopes` (an operator misconfiguration) is rendered as
 * an empty `scope=""` parameter — still RFC-shaped, so downstream
 * parsers don't crash, and the misconfiguration surfaces in client
 * logs rather than silently dropping the scope hint.
 */
export function buildBearerChallenge(config: Config): string {
  const resourceMetadata = `resource_metadata="${config.oauthProtectedResourceMetadataUrl}"`;
  const scopeValue = config.oauthScopes.join(" ");
  const scope = `scope="${scopeValue}"`;
  return `Bearer ${resourceMetadata}, ${scope}`;
}
