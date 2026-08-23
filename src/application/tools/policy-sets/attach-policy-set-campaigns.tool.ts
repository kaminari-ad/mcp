/**
 * Tool: `attach_policy_set_campaigns` — bind campaigns to a policy set
 * without disturbing this set's other members. A campaign bound to a
 * DIFFERENT set is reassigned, not rejected.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const MAX_CAMPAIGNS = 500;

const AttachPolicySetCampaignsInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
  campaign_ids: z
    .array(z.string().uuid())
    .min(1)
    .max(MAX_CAMPAIGNS)
    .describe(
      `Campaign UUIDs to bind, at most ${String(MAX_CAMPAIGNS)} per call. A campaign already on THIS set is a no-op; a campaign on a DIFFERENT set is moved to this one.`
    ),
} as const;
type AttachPolicySetCampaignsInputShape = typeof AttachPolicySetCampaignsInputShape;

export interface AttachPolicySetCampaignsOutput {
  readonly attached: number;
}

export const attachPolicySetCampaignsTool: Tool<
  AttachPolicySetCampaignsInputShape,
  AttachPolicySetCampaignsOutput
> = {
  name: "attach_policy_set_campaigns",
  description:
    "Bind campaigns to a policy set. This and `detach_policy_set_campaigns` are the only way to change membership — `update_policy_set` edits the set's name, description and rules, never its campaigns. Membership changes here are incremental: this set's other members are left alone. IMPORTANT: a campaign can belong to only one policy set, so naming a campaign currently on a DIFFERENT set MOVES it here — it stops being evaluated against its old set's rules, and no warning is returned. Check `list_campaigns` (`policy_set_id`) first when the campaign may already be bound elsewhere. Split lists longer than 500 across calls; verify with `list_policy_set_campaigns`.",
  annotations: {
    title: "Attach Policy Set Campaigns",
    readOnlyHint: false,
    // Reassigns a campaign away from whatever set it was on, and the
    // previous binding is not recoverable from this tool's output.
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(AttachPolicySetCampaignsInputShape),
  handler: async (input, ctx): Promise<Result<AttachPolicySetCampaignsOutput, ToolError>> => {
    // API returns 204 No Content on success.
    const result = await ctx.api.attachPolicySetCampaigns(input.policy_set_id, {
      campaign_ids: [...input.campaign_ids],
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ attached: input.campaign_ids.length });
  },
};
