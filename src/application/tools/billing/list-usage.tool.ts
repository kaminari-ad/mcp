/**
 * Tool: `list_usage` — paginated per-scan usage / cost log.
 */

import { z } from "zod";

import type { PaginatedResponse, UsageResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListUsageInputShape = {
  date_from: z.string().date().optional().describe("ISO date (YYYY-MM-DD), inclusive."),
  date_to: z.string().date().optional().describe("ISO date (YYYY-MM-DD), inclusive."),
  scan_id: z.string().uuid().optional().describe("Filter to one scan's cost rows."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListUsageInputShape = typeof ListUsageInputShape;

export type ListUsageOutput = PaginatedResponse<UsageResponse>;

export const listUsageTool: Tool<ListUsageInputShape, ListUsageOutput> = {
  name: "list_usage",
  description:
    "List per-scan usage rows (cost in micros, kind, scan id, timestamp). Use to attribute cost to specific scans or campaigns.",
  annotations: {
    title: "List Usage",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListUsageInputShape),
  handler: async (input, ctx): Promise<Result<ListUsageOutput, ToolError>> => {
    const filters = {
      page: input.page,
      limit: input.limit,
      ...(input.date_from !== undefined ? { date_from: input.date_from } : {}),
      ...(input.date_to !== undefined ? { date_to: input.date_to } : {}),
      ...(input.scan_id !== undefined ? { scan_id: input.scan_id } : {}),
    };
    const result = await ctx.api.listUsage(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
