/**
 * Tool: `get_run` — one run by UUID with progress counters.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { RunResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetRunInputShape = { run_id: z.string().uuid().describe("Run UUID.") } as const;
type GetRunInputShape = typeof GetRunInputShape;

export type GetRunOutput = RunResponse;

export const getRunTool: Tool<GetRunInputShape, GetRunOutput> = {
  name: "get_run",
  description:
        "Get one run by UUID with totals (queued, completed, failed, partial, cancelled), parent campaign, label, source.",
      annotations: { title: "Get Run", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(GetRunInputShape),
  handler: async (input, ctx): Promise<Result<GetRunOutput, ToolError>> => {
    const result = await ctx.api.getRun(input.run_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
