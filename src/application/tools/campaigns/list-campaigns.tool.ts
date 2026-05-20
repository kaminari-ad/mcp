/**
 * Tool: `list_campaigns` — paginated list of campaigns.
 *
 * Wraps `GET /api/v1/campaigns`.
 */

import { z } from "zod";

import type { CampaignResponse, PaginatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCampaignsInputShape = {
  group_id: z.string().uuid().optional().describe("Optional campaign-group UUID to filter by."),
  archived: z
    .boolean()
    .optional()
    .describe(
      "When omitted, the API returns active campaigns only. Pass `true` to see archived campaigns, `false` for active-only (explicit)."
    ),
  q: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Substring search against campaign name (case-insensitive)."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size (1-200)."),
} as const;
type ListCampaignsInputShape = typeof ListCampaignsInputShape;

export type ListCampaignsOutput = PaginatedResponse<CampaignResponse>;

export const listCampaignsTool: Tool<ListCampaignsInputShape, ListCampaignsOutput> = {
  name: "list_campaigns",
  description:
    "List campaigns for the caller's organization, optionally filtered by group, archived flag, or name substring. Paginated.",
  annotations: {
    title: "List Campaigns",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListCampaignsInputShape),
  handler: async (input, ctx): Promise<Result<ListCampaignsOutput, ToolError>> => {
    const filters = {
      page: input.page,
      limit: input.limit,
      ...(input.group_id !== undefined ? { group_id: input.group_id } : {}),
      ...(input.archived !== undefined ? { archived: input.archived } : {}),
      ...(input.q !== undefined ? { q: input.q } : {}),
    };
    const result = await ctx.api.listCampaigns(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
