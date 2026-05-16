/**
 * Tool: `list_campaign_groups` — paginated list of campaign groups.
 */

import { z } from "zod";

import type {
  CampaignGroupResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCampaignGroupsInputShape = {
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListCampaignGroupsInputShape = typeof ListCampaignGroupsInputShape;

export type ListCampaignGroupsOutput = PaginatedResponse<CampaignGroupResponse>;

export const listCampaignGroupsTool: Tool<ListCampaignGroupsInputShape, ListCampaignGroupsOutput> =
  {
    name: "list_campaign_groups",
    description:
      "List campaign groups — folders that group related campaigns. Includes per-group campaign count.",
    annotations: {
      title: "List Campaign Groups",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: z.object(ListCampaignGroupsInputShape),
    handler: async (input, ctx): Promise<Result<ListCampaignGroupsOutput, ToolError>> => {
      const result = await ctx.api.listCampaignGroups({ page: input.page, limit: input.limit });
      if (result.isErr()) return err(mapApiError(result.error));
      return ok(result.value);
    },
  };
