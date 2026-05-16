/**
 * Tool: `get_scan` — full detail for one scan by UUID.
 *
 * Wraps `GET /api/v1/scans/{id}`. Returns the most-used fields; nested
 * arrays (`redirect_chain`, `landings`) are omitted on purpose — they
 * are large and usually overkill for an agent answer. Add follow-up
 * tools later if needed.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { ScanResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetScanInputShape = {
  scan_id: z.string().uuid().describe("The scan's UUID (returned by `list_scans` or `create_scan`)."),
} as const;
type GetScanInputShape = typeof GetScanInputShape;

export type GetScanOutput = ScanResponse;

export const getScanTool: Tool<GetScanInputShape, GetScanOutput> = {
  name: "get_scan",
  description:
        "Get full detail for one scan by UUID: status, offer URL, screenshot URL, timing, labels, and the parent campaign if any.",
      annotations: { title: "Get Scan", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(GetScanInputShape),
  handler: async (input, ctx): Promise<Result<GetScanOutput, ToolError>> => {
    const result = await ctx.api.getScan(input.scan_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
