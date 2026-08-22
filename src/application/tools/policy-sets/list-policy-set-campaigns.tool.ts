/**
 * Tool: `list_policy_set_campaigns` — campaigns bound to one policy set.
 */

import { z } from "zod";

import type {
  LinkedCampaignResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListPolicySetCampaignsInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
  q: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Substring search against campaign name (case-insensitive)."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size (1-200)."),
} as const;
type ListPolicySetCampaignsInputShape = typeof ListPolicySetCampaignsInputShape;

export type ListPolicySetCampaignsOutput = PaginatedResponse<LinkedCampaignResponse>;

export const listPolicySetCampaignsTool: Tool<
  ListPolicySetCampaignsInputShape,
  ListPolicySetCampaignsOutput
> = {
  name: "list_policy_set_campaigns",
  description:
    "List the campaigns bound to a policy set, paginated, each with `id`, `name` and `is_archived`. `get_policy_set` returns only the first page of bindings plus a `campaigns_total`, so use this tool when a set has more campaigns than that page holds, or to search them by name. Read the membership here before `detach_policy_set_campaigns` — and before `delete_policy_set`, which the API refuses while any active campaign is still bound.",
  annotations: {
    title: "List Policy Set Campaigns",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListPolicySetCampaignsInputShape),
  handler: async (input, ctx): Promise<Result<ListPolicySetCampaignsOutput, ToolError>> => {
    const result = await ctx.api.listPolicySetCampaigns(input.policy_set_id, {
      page: input.page,
      limit: input.limit,
      ...(input.q !== undefined ? { q: input.q } : {}),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
