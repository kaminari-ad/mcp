/**
 * Tool: `get_alert_stats` — alert counts grouped by status.
 */

import { z } from "zod";

import type { AlertStatsResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { alertFilterFields, toAlertFilterQuery } from "./_alert-filter-fields.js";

const GetAlertStatsInputShape = alertFilterFields;
type GetAlertStatsInputShape = typeof GetAlertStatsInputShape;

export type GetAlertStatsOutput = AlertStatsResponse;

export const getAlertStatsTool: Tool<GetAlertStatsInputShape, GetAlertStatsOutput> = {
  name: "get_alert_stats",
  description:
    "Get alert counts grouped by status: open, escalated, resolved, dismissed. Accepts every filter `list_alerts` does except `status` — the response buckets BY status — so passing the same filters to both makes the four counts sum to the `total` that `list_alerts` reports. Unfiltered, the counts cover the whole organization over all time. Use this to size a selection before calling `bulk_update_alert_status` with `all_matching`.",
  annotations: {
    title: "Get Alert Stats",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetAlertStatsInputShape),
  handler: async (input, ctx): Promise<Result<GetAlertStatsOutput, ToolError>> => {
    const result = await ctx.api.getAlertStats(toAlertFilterQuery(input));
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
