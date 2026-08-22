/**
 * Tool: `attach_policy_set_campaigns` — bind campaigns to a policy set
 * without disturbing the existing bindings.
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
      `Campaign UUIDs to bind, at most ${String(MAX_CAMPAIGNS)} per call. Already-bound campaigns are accepted and left as they are.`
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
    "Bind campaigns to a policy set INCREMENTALLY — existing bindings survive. This is the tool to use for 'also apply this policy set to campaign X'. Do NOT reach for `update_policy_set` to change membership: it replaces the whole campaign list, so any binding you omit is silently dropped. Split lists longer than 500 across calls. Verify with `list_policy_set_campaigns`.",
  annotations: {
    title: "Attach Policy Set Campaigns",
    readOnlyHint: false,
    destructiveHint: false,
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
