/**
 * Tool: `list_alerts` — paginated alert list with filters by campaign and status.
 */

import { z } from "zod";

import type { AlertResponse, PaginatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { alertFilterFields, toAlertFilterQuery } from "./_alert-filter-fields.js";

const ListAlertsInputShape = {
  ...alertFilterFields,
  status: z
    .enum(["open", "escalated", "resolved", "dismissed"])
    .optional()
    .describe(
      "Filter by alert status. Open = unhandled; escalated = flagged for attention; resolved = closed; dismissed = closed without action."
    ),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListAlertsInputShape = typeof ListAlertsInputShape;

export type ListAlertsOutput = PaginatedResponse<AlertResponse>;

export const listAlertsTool: Tool<ListAlertsInputShape, ListAlertsOutput> = {
  name: "list_alerts",
  description:
    "List violation alerts (one per scan + violating rule combo) with offer URL, country, status, scan back-reference, and the kind-aware fields `rule_type` (tag / iab_v3 / brand / ai_category / custom_taxonomy) + `matched_value` (the canonical text the scan matched against). Filter by campaign, status, policy set, tag, country and creation-date range; `policy_set_id`, `tag` and `country_code` take comma-separated values and match any of them. Pass the same filters to `get_alert_stats` to get counts that agree with this list.",
  annotations: {
    title: "List Alerts",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListAlertsInputShape),
  handler: async (input, ctx): Promise<Result<ListAlertsOutput, ToolError>> => {
    const filters = {
      page: input.page,
      limit: input.limit,
      ...toAlertFilterQuery(input),
      ...(input.status !== undefined ? { status: input.status } : {}),
    };
    const result = await ctx.api.listAlerts(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
