/**
 * Tool: `list_runs` — paginated list of campaign runs with progress counters.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { PaginatedResponse, RunResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListRunsInputShape = {
  campaign_id: z.string().uuid().optional().describe("Filter to one campaign's runs."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListRunsInputShape = typeof ListRunsInputShape;

export type ListRunsOutput = PaginatedResponse<RunResponse>;

export const listRunsTool: Tool<ListRunsInputShape, ListRunsOutput> = {
  name: "list_runs",
  description:
        "List runs (one schedule execution = one run) with progress counters: total, completed, failed, partial, cancelled.",
      annotations: { title: "List Runs", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(ListRunsInputShape),
  handler: async (input, ctx): Promise<Result<ListRunsOutput, ToolError>> => {
    const filters = {
      page: input.page,
      limit: input.limit,
      ...(input.campaign_id !== undefined ? { campaign_id: input.campaign_id } : {}),
    };
    const result = await ctx.api.listRuns(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
