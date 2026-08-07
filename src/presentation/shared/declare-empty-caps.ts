/**
 * Declare empty `resources` and `prompts` capabilities + handlers on
 * a wired {@link McpServer}.
 *
 * Background: `McpServer` (the high-level SDK helper) auto-advertises
 * only the capabilities for which we register handlers. Since we only
 * register tools, the initialize response carries `{ tools: {...} }`
 * — no `resources`, no `prompts`. Most MCP clients (Cursor, Claude
 * Desktop, Cline) probe `resources/list` and `prompts/list` at
 * session start regardless. Without these handlers the SDK responds
 * with the JSON-RPC standard `-32601 Method not found`.
 *
 * `-32601` is spec-compliant, but Cursor's client SDK mistranslates
 * it into `"Failed to list MCP resources: MCP error -32000:
 * Connection closed"` (functional impact: zero — connection stays
 * open and every tool remains callable, but downstream agent log
 * parsers may interpret the warning as a real tool error, polluting
 * one log line per session per server).
 *
 * Calling this helper after {@link wireToolsIntoMcpServer} fixes
 * that: we advertise empty `resources` / `prompts` capabilities and
 * register handlers that return empty arrays. The startup probe is
 * silent; functional behaviour is unchanged.
 *
 * The pattern matches what popular MCP servers (filesystem, github,
 * brave-search) do for the same reason.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Both `resources/list` and `prompts/list` handlers below are
// genuinely synchronous (constant empty array), but the SDK signature
// is `(request) => Promise<T>`. Using `async () => ...` trips
// `@typescript-eslint/require-await`; a regular arrow returning
// `Promise.resolve(...)` trips `@typescript-eslint/promise-function-async`.
// The cleanest resolution is to mark the function async AND
// `await Promise.resolve(undefined)` so the rule's heuristic sees a
// genuine await. The runtime overhead is one microtask per startup
// probe (negligible).

/**
 * Wire empty `resources` / `prompts` capability handlers onto an
 * already-wired {@link McpServer}. Call after
 * {@link wireToolsIntoMcpServer}.
 */
export function declareEmptyResourcesAndPrompts(server: McpServer): void {
  server.server.registerCapabilities({ resources: {}, prompts: {} });
  server.server.setRequestHandler(ListResourcesRequestSchema, async () => {
    await Promise.resolve();
    return { resources: [] };
  });
  server.server.setRequestHandler(ListPromptsRequestSchema, async () => {
    await Promise.resolve();
    return { prompts: [] };
  });
}
