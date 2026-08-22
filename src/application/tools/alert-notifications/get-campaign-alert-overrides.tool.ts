/**
 * Tool: `get_campaign_alert_overrides` — per-campaign override of
 * which destinations receive its alerts (and a mute toggle).
 */

import { z } from "zod";

import type { CampaignOverridesResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetCampaignAlertOverridesInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID."),
} as const;
type GetCampaignAlertOverridesInputShape = typeof GetCampaignAlertOverridesInputShape;

export type GetCampaignAlertOverridesOutput = CampaignOverridesResponse;

export const getCampaignAlertOverridesTool: Tool<
  GetCampaignAlertOverridesInputShape,
  GetCampaignAlertOverridesOutput
> = {
  name: "get_campaign_alert_overrides",
  description:
    "Get the per-campaign override of which alert destinations receive its alerts. `mode` is one of `inherit` (no override — the campaign follows the org-wide destinations), `override` (alerts go ONLY to the returned `destination_ids`), or `silence` (the campaign sends nothing).",
  annotations: {
    title: "Get Campaign Alert Overrides",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetCampaignAlertOverridesInputShape),
  handler: async (input, ctx): Promise<Result<GetCampaignAlertOverridesOutput, ToolError>> => {
    const result = await ctx.api.getCampaignAlertOverrides(input.campaign_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
