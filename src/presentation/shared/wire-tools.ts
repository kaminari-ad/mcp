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
 * fresh per-request {@link ToolContext} via a lexical closure captured
 * inside `createHttpRequestHandler.handle`, while the stdio bootstrap
 * supplies a process-wide constant. The tool registry stays oblivious
 * to the difference.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { registerAllTools } from "../../application/tool-registry.js";
import type { ToolContext } from "../../application/tools/_shared/tool-context.js";
import type { ToolError } from "../../application/tools/_shared/tool-result.js";

/**
 * Provider returning the {@link ToolContext} active for the current
 * tool call. In stdio mode, always the same instance. In HTTP mode,
 * a per-request closure created inside the request handler so the SDK
 * callback (invoked synchronously during `Server.connect`) sees the
 * correct caller's API gateway / logger / request-id.
 */
export type ToolContextProvider = () => ToolContext;

/**
 * Register every tool from the registry into the given MCP server.
 *
 * @param server      - SDK `McpServer` to receive the registrations.
 * @param ctxProvider - Function returning the active `ToolContext`.
 */
export function wireToolsIntoMcpServer(server: McpServer, ctxProvider: ToolContextProvider): void {
  registerAllTools((tool) => {
    // The SDK accepts either a `ZodRawShape` (record of zod schemas)
    // or a full `ZodObject` for `inputSchema`. We pass the `ZodObject`
    // — same source of truth as the handler's input type, no chance
    // of drift between schema and TS type.
    //
    // The two casts below work around a typing limitation in
    // `@modelcontextprotocol/sdk@1.29`:
    //   1. `inputSchema: ... as never` — the SDK's union of
    //      `RegisterToolParams` overloads makes TS try to resolve our
    //      `ZodObject<RawShape>` against `ZodRawShape | ZodObject<...>`
    //      and blow the instantiation depth limit. The cast skips the
    //      union-check; the SDK reads the value at runtime and accepts
    //      both shapes.
    //   2. The callback cast at the end — because of (1), TS picks the
    //      no-input-schema overload whose callback is `(extra) => ...`
    //      instead of `(args, extra) => ...`. The runtime invokes our
    //      callback with both args; the cast realigns the signatures.
    //
    // Both casts are unsafe to TS only; runtime behaviour is identical
    // to the strictly-typed path. When the SDK ships a zod-version-
    // agnostic public type for `registerTool`, drop both.
    server.registerTool(
      tool.name,
      {
        title: tool.annotations.title,
        description: tool.description,
        inputSchema: tool.inputSchema as never,
        annotations: {
          title: tool.annotations.title,
          readOnlyHint: tool.annotations.readOnlyHint,
          destructiveHint: tool.annotations.destructiveHint,
          idempotentHint: tool.annotations.idempotentHint,
          openWorldHint: tool.annotations.openWorldHint,
        },
      },
      (async (rawArgs: unknown, _extra: unknown): Promise<CallToolResult> => {
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
      }) as never
    );
  });
}

function toolOkToMcpResult(value: unknown): CallToolResult {
  // Binary tools (screenshots, invoice PDFs) return a `{ content: [...] }`
  // shape directly so they can attach an `image` / `resource` block to
  // the CallToolResult instead of a JSON-text block. We detect that
  // shape and pass it through unchanged. This is the only place tools
  // can short-circuit the default text serialization.
  if (isMcpContentEnvelope(value)) {
    return value;
  }
  const isPlainObject = value !== null && typeof value === "object" && !Array.isArray(value);
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    ...(isPlainObject ? { structuredContent: value as Record<string, unknown> } : {}),
  };
}

function isBinaryBlockType(type: string): boolean {
  return type === "image" || type === "audio" || type === "resource";
}

function isMcpContentEnvelope(value: unknown): value is CallToolResult {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as { content?: unknown };
  if (!Array.isArray(v.content) || v.content.length === 0) return false;
  return v.content.every((block) => {
    if (block === null || typeof block !== "object") return false;
    const type = (block as { type?: unknown }).type;
    return typeof type === "string" && isBinaryBlockType(type);
  });
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
      return `Invalid input${error.code === undefined ? "" : ` (${error.code})`}: ${error.message}`;
    case "upstream":
      return `Upstream error: ${error.message}`;
    case "internal":
      return `Internal error: ${error.message}`;
  }
}
