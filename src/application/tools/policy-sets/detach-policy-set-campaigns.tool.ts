/**
 * Tool: `detach_policy_set_campaigns` — unbind campaigns from a policy
 * set without disturbing the bindings you keep.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const MAX_CAMPAIGNS = 500;

const DetachPolicySetCampaignsInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
  campaign_ids: z
    .array(z.string().uuid())
    .min(1)
    .max(MAX_CAMPAIGNS)
    .optional()
    .describe(
      `Campaign UUIDs to unbind, at most ${String(MAX_CAMPAIGNS)} per call. Omit when using \`detach_all\`.`
    ),
  detach_all: z
    .boolean()
    .optional()
    .describe(
      "Unbind EVERY campaign from this policy set. Check the current membership with `list_policy_set_campaigns` first — the campaigns stop being evaluated against these rules, so alerts they would have raised simply stop."
    ),
} as const;
type DetachPolicySetCampaignsInputShape = typeof DetachPolicySetCampaignsInputShape;

export interface DetachPolicySetCampaignsOutput {
  readonly detached: number | "all";
}

export const detachPolicySetCampaignsTool: Tool<
  DetachPolicySetCampaignsInputShape,
  DetachPolicySetCampaignsOutput
> = {
  name: "detach_policy_set_campaigns",
  description:
    "Unbind campaigns from a policy set INCREMENTALLY — the bindings you don't name survive. Pass `campaign_ids` for specific campaigns or `detach_all: true` to clear the whole membership. Use this rather than `update_policy_set`, which replaces the entire campaign list. Detaching leaves the policy set and its rules intact, and alerts already raised under it are kept.",
  annotations: {
    title: "Detach Policy Set Campaigns",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(DetachPolicySetCampaignsInputShape),
  handler: async (input, ctx): Promise<Result<DetachPolicySetCampaignsOutput, ToolError>> => {
    // Cross-field rules live here rather than in `inputSchema`, which
    // must stay a plain ZodObject for the SDK.
    const detachAll = input.detach_all === true;
    if ((input.campaign_ids !== undefined) === detachAll) {
      return err({
        kind: "invalid-input",
        message:
          "Choose either `campaign_ids` or `detach_all: true` — not both, and not neither. Passing neither would be a silent no-op.",
      });
    }
    // API returns 204 No Content on success.
    const result = await ctx.api.detachPolicySetCampaigns(input.policy_set_id, {
      detach_all: detachAll,
      ...(input.campaign_ids !== undefined ? { campaign_ids: [...input.campaign_ids] } : {}),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ detached: detachAll ? "all" : (input.campaign_ids?.length ?? 0) });
  },
};
