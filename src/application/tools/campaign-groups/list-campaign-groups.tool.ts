/**
 * Tool: `list_campaign_groups` — list campaign groups (not paginated).
 *
 * The `/api/v1/campaign-groups` endpoint returns a bare array. The
 * only documented filter is `archived` (default false). To agents we
 * expose just that.
 */

import { z } from "zod";

import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCampaignGroupsInputShape = {
  archived: z
    .boolean()
    .optional()
    .describe("If true, list ONLY archived groups. Default: only active groups."),
} as const;
type ListCampaignGroupsInputShape = typeof ListCampaignGroupsInputShape;

export interface ListCampaignGroupsOutput {
  readonly items: readonly CampaignGroupResponse[];
}

export const listCampaignGroupsTool: Tool<ListCampaignGroupsInputShape, ListCampaignGroupsOutput> =
  {
    name: "list_campaign_groups",
    description:
      "List campaign groups — folders that group related campaigns. Includes per-group campaign count. Not paginated; the org-scoped list is typically small (a few dozen groups max).",
    annotations: {
      title: "List Campaign Groups",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: z.object(ListCampaignGroupsInputShape),
    handler: async (input, ctx): Promise<Result<ListCampaignGroupsOutput, ToolError>> => {
      const filters = input.archived === undefined ? {} : { archived: input.archived };
      const result = await ctx.api.listCampaignGroups(filters);
      if (result.isErr()) return err(mapApiError(result.error));
      // Wrap the bare array in `{ items }` so tool output is a JSON
      // object — consistent with every other `list_*` tool's shape.
      return ok({ items: result.value });
    },
  };
