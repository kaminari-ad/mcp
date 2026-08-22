/**
 * Tool: `list_campaign_groups` — list campaign groups (not paginated).
 *
 * The `/api/v1/campaign-groups` endpoint returns a bare array, so the
 * filters below narrow the result server-side instead of paging.
 */

import { z } from "zod";

import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import {
  campaignDateFilterFields,
  toCampaignDateFilterQuery,
} from "../_shared/campaign-date-filters.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCampaignGroupsInputShape = {
  archived: z
    .boolean()
    .optional()
    .describe("If true, list ONLY archived groups. Default: only active groups."),
  q: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Substring search against group name (case-insensitive)."),
  ...campaignDateFilterFields,
} as const;
type ListCampaignGroupsInputShape = typeof ListCampaignGroupsInputShape;

export interface ListCampaignGroupsOutput {
  readonly items: readonly CampaignGroupResponse[];
}

export const listCampaignGroupsTool: Tool<ListCampaignGroupsInputShape, ListCampaignGroupsOutput> =
  {
    name: "list_campaign_groups",
    description:
      "List campaign groups — folders that group related campaigns — with per-group campaign count and `last_run_at`. Filter by archived flag, name substring, or creation / last-run date range; a group's last run is the newest run across its campaigns. Not paginated; the org-scoped list is typically small (a few dozen groups max).",
    annotations: {
      title: "List Campaign Groups",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: z.object(ListCampaignGroupsInputShape),
    handler: async (input, ctx): Promise<Result<ListCampaignGroupsOutput, ToolError>> => {
      const filters = {
        ...toCampaignDateFilterQuery(input),
        ...(input.archived !== undefined ? { archived: input.archived } : {}),
        ...(input.q !== undefined ? { q: input.q } : {}),
      };
      const result = await ctx.api.listCampaignGroups(filters);
      if (result.isErr()) return err(mapApiError(result.error));
      // Wrap the bare array in `{ items }` so tool output is a JSON
      // object — consistent with every other `list_*` tool's shape.
      return ok({ items: result.value });
    },
  };
