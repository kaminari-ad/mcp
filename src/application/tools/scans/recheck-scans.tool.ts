/**
 * Tool: `recheck_scans` — re-run the checker pipeline against recent
 * completed scans (e.g. after policies were updated).
 *
 * Wraps `POST /api/v1/scans/recheck`. Scope is either "the last N
 * scans" or "all scans from the last N hours". Both have API-side
 * caps to prevent abuse.
 */

import { z } from "zod";

import type { RecheckResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const RecheckScansInputShape = {
  scope_type: z
    .enum(["last_n", "hours"])
    .describe(
      "Selection mode. `last_n` = most recent N scans; `hours` = scans from the past N hours."
    ),
  scope_value: z
    .number()
    .int()
    .min(1)
    .max(5000)
    .describe(
      "Number of scans (`last_n`, max 5000) OR number of hours (`hours`, max 72). API enforces tighter caps per mode."
    ),
} as const;
type RecheckScansInputShape = typeof RecheckScansInputShape;

export type RecheckScansOutput = RecheckResponse;

export const recheckScansTool: Tool<RecheckScansInputShape, RecheckScansOutput> = {
  name: "recheck_scans",
  description:
    "Re-run the checker pipeline against recent COMPLETED scans (e.g. after updating policies or custom rules). Returns the number of scans queued for re-evaluation. No new crawl fee — only the checker cost.",
  annotations: {
    title: "Recheck Scans",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(RecheckScansInputShape),
  handler: async (input, ctx): Promise<Result<RecheckScansOutput, ToolError>> => {
    const result = await ctx.api.recheckScans({
      scope_type: input.scope_type,
      scope_value: input.scope_value,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
