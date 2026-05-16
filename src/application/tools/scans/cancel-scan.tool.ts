/**
 * Tool: `cancel_scan` — cancel a single pending scan.
 *
 * Wraps `POST /api/v1/scans/{id}/cancel`. Only `pending` scans can be
 * cancelled; running and completed scans are no-ops (the API enforces).
 * Returns the count of cancelled scans (0 or 1) — refunds credits.
 */

import { z } from "zod";

import type { CancelPendingResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CancelScanInputShape = {
  scan_id: z.string().uuid().describe("UUID of the pending scan to cancel."),
} as const;
type CancelScanInputShape = typeof CancelScanInputShape;

export type CancelScanOutput = CancelPendingResponse;

export const cancelScanTool: Tool<CancelScanInputShape, CancelScanOutput> = {
  name: "cancel_scan",
  description:
    "Cancel one pending scan by UUID. Already-running or completed scans are no-ops. Cancellation refunds the scan credit.",
  annotations: {
    title: "Cancel Scan",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(CancelScanInputShape),
  handler: async (input, ctx): Promise<Result<CancelScanOutput, ToolError>> => {
    const result = await ctx.api.cancelScan(input.scan_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
