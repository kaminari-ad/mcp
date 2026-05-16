/**
 * Tool: `cancel_run` — cancel every pending scan in one run.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { ArchiveOrCancelResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CancelRunInputShape = { run_id: z.string().uuid().describe("Run UUID.") } as const;
type CancelRunInputShape = typeof CancelRunInputShape;

export type CancelRunOutput = ArchiveOrCancelResponse;

export const cancelRunTool: Tool<CancelRunInputShape, CancelRunOutput> = {
  name: "cancel_run",
  description:
    "Cancel every pending scan within one run. Running scans complete; pending ones get refunded. Returns the count of cancelled scans.",
  annotations: {
    title: "Cancel Run",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(CancelRunInputShape),
  handler: async (input, ctx): Promise<Result<CancelRunOutput, ToolError>> => {
    const result = await ctx.api.cancelRun(input.run_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
