/**
 * Tool: `get_usage_summary` — one-liner aggregate over the current
 * billing period.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { UsagePeriodSummaryResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetUsageSummaryInputShape = {} as const;
type GetUsageSummaryInputShape = typeof GetUsageSummaryInputShape;

export type GetUsageSummaryOutput = UsagePeriodSummaryResponse;

export const getUsageSummaryTool: Tool<GetUsageSummaryInputShape, GetUsageSummaryOutput> = {
  name: "get_usage_summary",
  description:
    "Get a one-liner aggregate of usage for the current billing period: total cost (micros), check count, period start/end.",
  annotations: {
    title: "Get Usage Summary",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetUsageSummaryInputShape),
  handler: async (_input, ctx): Promise<Result<GetUsageSummaryOutput, ToolError>> => {
    const result = await ctx.api.getUsageSummary();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
