/**
 * Bridge from the {@link Tool} contract to the MCP SDK's
 * `server.registerTool(...)` call.
 *
 * Used by both transport bootstraps. Keeps the SDK-specific shape of
 * `CallToolResult` and the conversion of `ToolError` -> error envelope
 * out of every individual tool — tools only know about `Result` and
 * `ToolError`.
 *
 * The `ctxProvider` indirection lets the HTTP bootstrap supply a
 * fresh per-request {@link ToolContext} via AsyncLocalStorage, while
 * the stdio bootstrap supplies a process-wide constant. The tool
 * registry stays oblivious to the difference.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { registerAllTools } from "../../application/tool-registry.js";
import type { ToolContext } from "../../application/tools/_shared/tool-context.js";
import type { ToolError } from "../../application/tools/_shared/tool-result.js";

/**
 * Provider returning the {@link ToolContext} active for the current
 * tool call. In stdio mode, always the same instance. In HTTP mode,
 * scoped per-request via AsyncLocalStorage.
 */
export type ToolContextProvider = () => ToolContext;

/**
 * Register every tool from the registry into the given MCP server.
 *
 * @param server      - SDK `McpServer` to receive the registrations.
 * @param ctxProvider - Function returning the active `ToolContext`.
 */
export function wireToolsIntoMcpServer(
  server: McpServer,
  ctxProvider: ToolContextProvider
): void {
  registerAllTools((tool) => {
    // The SDK accepts either a ZodRawShape or a full ZodObject for
    // `inputSchema`. We pass the ZodObject — it's the same source of
    // truth as the handler's input type, with no chance of drift.
    server.registerTool(
      tool.name,
      {
        title: tool.annotations.title,
        description: tool.description,
        // @ts-expect-error SDK bundles its own zod v4 internally; our project
        // pins zod v3, so the ZodObject branded type does not line up with
        // the SDK's `AnySchema`. The runtime accepts both — only the static
        // types disagree. Remove this comment when we upgrade to zod v4.
        inputSchema: tool.inputSchema,
        annotations: {
          title: tool.annotations.title,
          readOnlyHint: tool.annotations.readOnlyHint,
          destructiveHint: tool.annotations.destructiveHint,
          idempotentHint: tool.annotations.idempotentHint,
          openWorldHint: tool.annotations.openWorldHint,
        },
      },
      async (rawArgs: unknown, _extra: unknown): Promise<CallToolResult> => {
        const ctx = ctxProvider();
        // `rawArgs` was already validated by the SDK; re-parse once
        // through our schema to recover the precise narrow type the
        // handler needs. Cheap; runs only once per call.
        const parsed = tool.inputSchema.parse(rawArgs);
        const result = await tool.handler(parsed, ctx);
        if (result.isErr()) {
          return toolErrorToMcpResult(result.error);
        }
        return toolOkToMcpResult(result.value);
      }
    );
  });
}

function toolOkToMcpResult(value: unknown): CallToolResult {
  const isPlainObject =
    value !== null && typeof value === "object" && !Array.isArray(value);
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    ...(isPlainObject ? { structuredContent: value as Record<string, unknown> } : {}),
  };
}

function toolErrorToMcpResult(error: ToolError): CallToolResult {
  return {
    isError: true,
    content: [{ type: "text", text: formatToolError(error) }],
  };
}

function formatToolError(error: ToolError): string {
  switch (error.kind) {
    case "unauthorized":
      return `Unauthorized: ${error.message}`;
    case "forbidden":
      return `Forbidden${error.code === undefined ? "" : ` (${error.code})`}: ${error.message}`;
    case "not-found":
      return `Not found: ${error.message}`;
    case "rate-limited":
      return `Rate limited: ${error.message}${
        error.retryAfterMs === undefined ? "" : ` (retry after ${String(error.retryAfterMs)} ms)`
      }`;
    case "invalid-input":
      return `Invalid input: ${error.message}`;
    case "upstream":
      return `Upstream error: ${error.message}`;
    case "internal":
      return `Internal error: ${error.message}`;
  }
}
