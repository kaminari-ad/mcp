/**
 * Tool: `set_campaign_alert_overrides` — REPLACE per-campaign
 * notification routing.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import { alertRoutingFields, alertRoutingInputError } from "../_shared/alert-routing-input.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const SetCampaignAlertOverridesInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID."),
  ...alertRoutingFields,
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
    "REPLACE the per-campaign alert-routing override. `mode=inherit` drops the override so the campaign follows the org-wide destinations; `mode=override` routes its alerts ONLY to `destination_ids`; `mode=silence` sends nothing for the campaign. `routing_label_key` adds label routing on top of inherit/override: each scan also reaches the destinations whose label rule matches its value (e.g. one DSP's chat in a shared campaign). There is no 'route everywhere except these' mode — to exclude one destination, pass `override` with the destinations you DO want (see `list_alert_destinations`). To read the new state, follow up with `get_campaign_alert_overrides`.",
  annotations: {
    title: "Set Campaign Alert Overrides",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(SetCampaignAlertOverridesInputShape),
  handler: async (input, ctx): Promise<Result<SetCampaignAlertOverridesOutput, ToolError>> => {
    // Cross-field rules live in the handler because `Tool.inputSchema`
    // must stay a plain ZodObject for the SDK.
    const invalid = alertRoutingInputError(input);
    if (invalid) return err(invalid);
    // API returns 204 No Content on success.
    const result = await ctx.api.setCampaignAlertOverrides(input.campaign_id, {
      mode: input.mode,
      destination_ids: input.destination_ids,
      routing_label_key: input.routing_label_key ?? null,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ updated: true });
  },
};
