/**
 * Tool: `set_campaign_alert_overrides` — REPLACE per-campaign
 * notification routing.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const SetCampaignAlertOverridesInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID."),
  mode: z
    .enum(["inherit", "include", "exclude"])
    .describe(
      "Routing mode: `inherit` (use org defaults), `include` (route ONLY to listed destinations), `exclude` (route everywhere EXCEPT listed)."
    ),
  destination_ids: z
    .array(z.string().uuid())
    .max(50)
    .default([])
    .describe(
      "Destination UUIDs the mode acts on. Required for `include`/`exclude`; ignored for `inherit`."
    ),
} as const;
type SetCampaignAlertOverridesInputShape = typeof SetCampaignAlertOverridesInputShape;

export interface SetCampaignAlertOverridesOutput {
  readonly updated: true;
}

export const setCampaignAlertOverridesTool: Tool<
  SetCampaignAlertOverridesInputShape,
  SetCampaignAlertOverridesOutput
> = {
  name: "set_campaign_alert_overrides",
  description:
    "REPLACE the per-campaign alert-routing override. `mode=inherit` falls back to org defaults; `mode=include` routes ONLY to the listed destinations; `mode=exclude` routes everywhere EXCEPT the listed destinations. To read the new state, follow up with `get_campaign_alert_overrides`.",
  annotations: {
    title: "Set Campaign Alert Overrides",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(SetCampaignAlertOverridesInputShape),
  handler: async (input, ctx): Promise<Result<SetCampaignAlertOverridesOutput, ToolError>> => {
    // API returns 204 No Content on success.
    const result = await ctx.api.setCampaignAlertOverrides(input.campaign_id, {
      mode: input.mode,
      destination_ids: input.destination_ids,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ updated: true });
  },
};
