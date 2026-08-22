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
  // enum-drift: allow — the API validates these three values but types
  // the field as a plain string, so no generated schema constrains it.
  // Swap to `schemas.CampaignOverrideMode` after the api enum change
  // (`fix/type-override-mode-and-unlist-forms`) reaches prod and the
  // next `make gen-api-types` picks it up.
  mode: z
    .enum(["inherit", "override", "silence"])
    .describe(
      "Routing mode: `inherit` (fall back to the org-wide destinations), `override` (route ONLY to `destination_ids`), `silence` (send nothing for this campaign)."
    ),
  destination_ids: z
    .array(z.string().uuid())
    .max(50)
    .default([])
    .describe(
      "Destination UUIDs to route to. Accepted ONLY with `mode: override` — the API rejects it for `inherit`/`silence`. An empty list with `override` routes nowhere, which is the same outcome as `silence`."
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
    "REPLACE the per-campaign alert-routing override. `mode=inherit` drops the override so the campaign follows the org-wide destinations; `mode=override` routes its alerts ONLY to `destination_ids`; `mode=silence` sends nothing for the campaign. There is no 'route everywhere except these' mode — to exclude one destination, pass `override` with the destinations you DO want (see `list_alert_destinations`). To read the new state, follow up with `get_campaign_alert_overrides`.",
  annotations: {
    title: "Set Campaign Alert Overrides",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(SetCampaignAlertOverridesInputShape),
  handler: async (input, ctx): Promise<Result<SetCampaignAlertOverridesOutput, ToolError>> => {
    // The API answers 422 `notifications.invalid_override_combination`
    // here; refusing locally gives the agent a fixable message instead
    // of a round trip. Cross-field rules live in the handler because
    // `Tool.inputSchema` must stay a plain ZodObject for the SDK.
    if (input.mode !== "override" && input.destination_ids.length > 0) {
      return err({
        kind: "invalid-input",
        message: `destination_ids is only accepted with mode "override", got "${input.mode}". Use mode "override" to route to specific destinations.`,
        fieldErrors: { destination_ids: ["only valid with mode 'override'"] },
      });
    }
    // API returns 204 No Content on success.
    const result = await ctx.api.setCampaignAlertOverrides(input.campaign_id, {
      mode: input.mode,
      destination_ids: input.destination_ids,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ updated: true });
  },
};
