/**
 * Tool: `get_alert_stats` — alert counts grouped by status.
 */

import { z } from "zod";

import type { AlertStatsResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetAlertStatsInputShape = {} as const;
type GetAlertStatsInputShape = typeof GetAlertStatsInputShape;

export type GetAlertStatsOutput = AlertStatsResponse;

export const getAlertStatsTool: Tool<GetAlertStatsInputShape, GetAlertStatsOutput> = {
  name: "get_alert_stats",
  description:
    "Get alert counts grouped by status: open, escalated, resolved, dismissed. Counts cover the whole organization over all time and are not filtered, so the four sum to the `total` an unfiltered `list_alerts` reports. Status names match the canonical AlertStatus enum used by `list_alerts` and `update_alert_status`.",
  annotations: {
    title: "Get Alert Stats",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetAlertStatsInputShape),
  handler: async (_input, ctx): Promise<Result<GetAlertStatsOutput, ToolError>> => {
    const result = await ctx.api.getAlertStats();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
