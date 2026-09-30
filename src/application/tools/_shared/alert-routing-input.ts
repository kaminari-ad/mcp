/**
 * Shared zod fields + cross-field check for per-campaign alert routing.
 *
 * `set_campaign_alert_overrides` and the `notifications` block of
 * `create_campaign` / `update_campaign` accept the same mode, destination
 * list and label routing key, with the same API-side combination rules
 * (422 `notifications.invalid_override_combination` /
 * `notifications.invalid_label_routing_combination`). Checking them here
 * gives the agent a fixable message instead of a round trip.
 */
import { z } from "zod";

import { schemas } from "../../../shared/api/zod-schemas.js";
import type { ToolError } from "./tool-result.js";

export const alertRoutingFields = {
  mode: schemas.CampaignOverrideMode.describe(
    "Routing mode: `inherit` (fall back to the org-wide destinations), `override` (route ONLY to `destination_ids`), `silence` (send nothing for this campaign)."
  ),
  destination_ids: z
    .array(z.string().uuid())
    .max(50)
    .default([])
    .describe(
      "Destination UUIDs to route to. Accepted ONLY with `mode: override` — the API rejects it for `inherit`/`silence`. An empty list with `override` routes nowhere, which is the same outcome as `silence`."
    ),
  routing_label_key: z
    .string()
    .min(1)
    .max(64)
    .nullable()
    .optional()
    .describe(
      "Scan label key to route by on top of `inherit` or `override` (e.g. `dspName`): each scan also goes to the destinations whose label rule matches the scan's value for this key, as shown by `route_label_key` / `route_label_values` in `list_alert_destinations`. Omit or pass null for no label routing — the routing is replaced as a whole, so omitting it clears a key already set (read `get_campaign_alert_overrides` first to keep it). Not allowed with `silence`."
    ),
} as const;

interface AlertRoutingInput {
  readonly mode: string;
  readonly destination_ids: readonly string[];
  readonly routing_label_key?: string | null | undefined;
}

/** The API's combination rules, checked before the call. */
export function alertRoutingInputError(input: AlertRoutingInput): ToolError | undefined {
  if (input.mode !== "override" && input.destination_ids.length > 0) {
    return {
      kind: "invalid-input",
      message: `destination_ids is only accepted with mode "override", got "${input.mode}". Use mode "override" to route to specific destinations.`,
      fieldErrors: { destination_ids: ["only valid with mode 'override'"] },
    };
  }
  if (input.mode === "silence" && input.routing_label_key) {
    return {
      kind: "invalid-input",
      message:
        'routing_label_key cannot be combined with mode "silence". Use "inherit" or "override" to route by a label.',
      fieldErrors: { routing_label_key: ["not valid with mode 'silence'"] },
    };
  }
  return undefined;
}
