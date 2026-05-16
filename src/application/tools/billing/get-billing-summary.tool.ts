/**
 * Tool: `get_billing_summary` — credit balance, plan, period usage,
 * suspension state. Useful for agents before creating scans (cost) or
 * when troubleshooting "why was my scan rejected".
 */

import { z } from "zod";

import type { BillingSummaryResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetBillingSummaryInputShape = {} as const;
type GetBillingSummaryInputShape = typeof GetBillingSummaryInputShape;

export type GetBillingSummaryOutput = BillingSummaryResponse;

export const getBillingSummaryTool: Tool<GetBillingSummaryInputShape, GetBillingSummaryOutput> = {
  name: "get_billing_summary",
  description:
    "Get the organization's billing snapshot: balance (in micros), current plan, period usage counters, suspension state, and whether new scans are accepted right now.",
  annotations: {
    title: "Get Billing Summary",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetBillingSummaryInputShape),
  handler: async (_input, ctx): Promise<Result<GetBillingSummaryOutput, ToolError>> => {
    const result = await ctx.api.getBillingSummary();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
