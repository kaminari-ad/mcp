/**
 * The `Tool<Input, Output>` contract.
 *
 * Every file under `application/tools/<domain>/*.tool.ts` exports
 * exactly one `Tool` instance. The custom CI gate
 * `scripts/check-tool-naming.ts` enforces the file/name conventions.
 *
 * Handlers receive `(input, ctx)` and return
 * `Result<Output, ToolError>`. They MUST NOT throw and MUST NOT touch
 * globals — `ctx` is the only seam to the outside world. ESLint
 * `no-restricted-imports` rejects any import from `infrastructure/`
 * inside this directory.
 */

import type { z } from "zod";

import type { Result } from "../../../shared/result.js";
import type { ToolContext } from "./tool-context.js";
import type { ToolError } from "./tool-result.js";

/**
 * MCP tool behaviour hints — used by clients (Claude, Cursor) to
 * decide UX details (warn-before-destructive, allow-without-confirm,
 * cache-friendly, etc.).
 *
 * Mandatory under the Anthropic Software Directory Policy §5E. Every
 * `Tool` in this codebase MUST set them via the `annotations` field
 * below; the `check-tool-naming.ts` gate verifies presence.
 */
export interface ToolAnnotations {
  /** Human-readable label distinct from the snake_case `name`. */
  readonly title: string;
  /** `true` ⇒ the tool does not modify state (safe to call freely). */
  readonly readOnlyHint: boolean;
  /** `true` ⇒ the tool can destroy data irrecoverably. */
  readonly destructiveHint: boolean;
  /** `true` ⇒ multiple calls with the same input behave like one call. */
  readonly idempotentHint: boolean;
  /**
   * `false` ⇒ this tool only interacts with a single closed system
   * (the caller's Kaminari Ad organization). We always set `false`
   * — no tool here touches the public Internet or unknown systems.
   */
  readonly openWorldHint: boolean;
}

/**
 * A typed MCP tool definition.
 *
 * `inputSchema` is required to be a `ZodObject` because every MCP
 * tool's input is a structured object (the spec says `inputSchema`
 * MUST be a JSON Schema of type `object`). This also lets the
 * transport extract `inputSchema.shape` cheaply when wiring into the
 * underlying SDK.
 *
 * @typeParam TShape - The zod raw shape, e.g. `{ id: z.string() }`.
 * @typeParam Output - The structured value the handler returns on
 *                     success. The transport converts it into MCP
 *                     `content` blocks (text JSON by default; tools
 *                     that produce images return them explicitly).
 */
export interface Tool<TShape extends z.ZodRawShape, Output> {
  readonly name: string;
  /**
   * Human-readable description shown to the agent. Write FOR the
   * agent: clear, action-oriented, 1-2 sentences. Side effects MUST
   * be called out explicitly (`"Create a new scan. Costs N credits;
   * charged immediately."`).
   */
  readonly description: string;
  /**
   * MCP behaviour annotations (Anthropic Software Directory Policy
   * §5E). Mandatory.
   */
  readonly annotations: ToolAnnotations;
  /**
   * zod object schema parsed by the transport before the handler
   * runs. Every field must have `.describe()` text so the agent knows
   * what to pass.
   */
  readonly inputSchema: z.ZodObject<TShape>;
  /**
   * Pure-ish business handler. No `throw`, no globals, no I/O outside
   * `ctx.api`. Returns `Result<Output, ToolError>`.
   */
  readonly handler: (
    input: z.infer<z.ZodObject<TShape>>,
    ctx: ToolContext
  ) => Promise<Result<Output, ToolError>>;
}

/**
 * Callback supplied by the transport. The transport registers each
 * tool with the underlying MCP SDK while keeping the tool's narrow
 * generic types intact end-to-end.
 *
 * Used by {@link registerAllTools} in `tool-registry.ts`.
 */
export type RegisterTool = <TShape extends z.ZodRawShape, Output>(
  tool: Tool<TShape, Output>
) => void;
