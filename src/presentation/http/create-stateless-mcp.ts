/**
 * Build a fresh, single-use MCP server + transport for ONE stateless
 * HTTP request.
 *
 * Stateless mode (`sessionIdGenerator: undefined`): the SDK issues no
 * `Mcp-Session-Id` and performs no session validation, so any replica
 * can serve any request — no sticky routing, no shared session store.
 * The SDK requires a fresh transport per request (reusing a stateless
 * transport collides message ids across clients), so the caller MUST
 * close both `server` and `transport` once the response is sent.
 *
 * Every request is independently authenticated by its own Bearer via the
 * `ToolContext.api` gateway the caller builds; there is no cross-request
 * state to hijack (see CONTRIBUTING.md "Tenant isolation").
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import type { ToolContext } from "../../application/tools/_shared/tool-context.js";
import { SERVER_INSTRUCTIONS } from "../../shared/server-instructions.js";
import { NAME, VERSION } from "../../shared/version.js";
import { declareEmptyResourcesAndPrompts } from "../shared/declare-empty-caps.js";
import { wireToolsIntoMcpServer } from "../shared/wire-tools.js";

/**
 * A single-use MCP server + transport pair for one stateless request.
 * The caller closes both after the response (see the handler).
 */
export interface StatelessMcp {
  readonly server: McpServer;
  readonly transport: StreamableHTTPServerTransport;
}

/**
 * Create a fresh stateless MCP server + transport bound to one request's
 * {@link ToolContext}. No session id is issued; the transport handles a
 * single request and is then discarded by the caller.
 */
export async function createStatelessMcp(ctx: ToolContext): Promise<StatelessMcp> {
  const server = new McpServer(
    { name: NAME, version: VERSION },
    { instructions: SERVER_INSTRUCTIONS }
  );
  // The ctx is fixed for this request, so a constant provider is correct
  // (no per-request swap needed — the server is single-use).
  wireToolsIntoMcpServer(server, () => ctx);
  declareEmptyResourcesAndPrompts(server);

  const transport = new StreamableHTTPServerTransport({
    // Stateless mode: leaving `sessionIdGenerator` unset (undefined) tells
    // the SDK transport to issue no Mcp-Session-Id and skip session
    // validation. We omit the key rather than pass an explicit `undefined`
    // because `exactOptionalPropertyTypes` rejects the latter.
    enableJsonResponse: true,
  });

  try {
    // @ts-expect-error SDK's Transport.onclose union (() => void) | undefined
    // mismatches Server.connect's expected non-optional type. Harmless;
    // fixed upstream in a future SDK release.
    await server.connect(transport);
  } catch (cause) {
    // Connect failed — free both so a failed request can't leak the
    // half-built pair (the handler only registers cleanup on success).
    await transport.close().catch(() => undefined);
    await server.close().catch(() => undefined);
    throw cause;
  }
  return { server, transport };
}
