/**
 * Tool: `set_campaign_alert_overrides` — REPLACE per-campaign
 * notification routing.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CampaignAlertOverrides } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const SetCampaignAlertOverridesInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID."),
  destination_ids: z
    .array(z.string().uuid())
    .max(50)
    .describe("Replacement list of destination UUIDs. Empty array = use org defaults."),
  muted: z.boolean().describe("If true, no alerts for this campaign are dispatched anywhere."),
} as const;
type SetCampaignAlertOverridesInputShape = typeof SetCampaignAlertOverridesInputShape;

export type SetCampaignAlertOverridesOutput = CampaignAlertOverrides;

export const setCampaignAlertOverridesTool: Tool<
  SetCampaignAlertOverridesInputShape,
  SetCampaignAlertOverridesOutput
> = {
  name: "set_campaign_alert_overrides",
  description:
    "REPLACE the per-campaign alert-routing override: which destinations receive alerts from this campaign and a mute toggle. Pass empty `destination_ids` to fall back to org-level defaults.",
  annotations: {
    title: "Set Campaign Alert Overrides",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(SetCampaignAlertOverridesInputShape),
  handler: async (
    input,
    ctx
  ): Promise<Result<SetCampaignAlertOverridesOutput, ToolError>> => {
    const result = await ctx.api.setCampaignAlertOverrides(input.campaign_id, {
      destination_ids: input.destination_ids,
      muted: input.muted,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
