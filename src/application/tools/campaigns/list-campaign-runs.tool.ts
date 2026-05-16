/**
 * Tool: `list_campaign_runs` — paginated runs of ONE campaign with
 * progress counters. Use when you have a campaign-id and want its
 * history; for a global list across campaigns use `list_runs`.
 */

import { z } from "zod";

import type { PaginatedResponse, RunResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCampaignRunsInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListCampaignRunsInputShape = typeof ListCampaignRunsInputShape;

export type ListCampaignRunsOutput = PaginatedResponse<RunResponse>;

export const listCampaignRunsTool: Tool<ListCampaignRunsInputShape, ListCampaignRunsOutput> = {
  name: "list_campaign_runs",
  description:
    "List every run (scheduled execution) of one campaign, paginated, with per-run counters.",
  annotations: {
    title: "List Campaign Runs",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListCampaignRunsInputShape),
  handler: async (input, ctx): Promise<Result<ListCampaignRunsOutput, ToolError>> => {
    const result = await ctx.api.listCampaignRuns(input.campaign_id, {
      page: input.page,
      limit: input.limit,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
