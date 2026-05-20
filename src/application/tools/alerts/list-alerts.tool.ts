/**
 * Tool: `list_alerts` — paginated alert list with filters by campaign and status.
 */

import { z } from "zod";

import type { AlertResponse, PaginatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListAlertsInputShape = {
  campaign_id: z.string().uuid().optional().describe("Filter to one campaign's alerts."),
  status: z
    .enum(["open", "acknowledged", "resolved", "dismissed"])
    .optional()
    .describe(
      "Filter by alert status. Open = unhandled; acknowledged = seen by an operator; resolved = closed; dismissed = closed without action."
    ),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListAlertsInputShape = typeof ListAlertsInputShape;

export type ListAlertsOutput = PaginatedResponse<AlertResponse>;

export const listAlertsTool: Tool<ListAlertsInputShape, ListAlertsOutput> = {
  name: "list_alerts",
  description:
    "List violation alerts (one per scan + violating-tag combo) with offer URL, tag, country, status, scan back-reference.",
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
      ...(input.campaign_id !== undefined ? { campaign_id: input.campaign_id } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    };
    const result = await ctx.api.listAlerts(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
