/**
 * Optional `notifications` block of `create_campaign` / `update_campaign`.
 *
 * Saves the campaign's alert routing in the same request as the
 * campaign itself (same fields as `set_campaign_alert_overrides`).
 */
import { z } from "zod";

import type { CreateCampaignRequest } from "../../../domain/ports/api-gateway.js";
import { alertRoutingFields } from "../_shared/alert-routing-input.js";

const notificationsBlock = z.object(alertRoutingFields);

type NotificationsInput = z.infer<typeof notificationsBlock>;

/** Request body for the block: an omitted routing key is sent as null. */
export function notificationsBody(
  input: NotificationsInput
): NonNullable<CreateCampaignRequest["notifications"]> {
  return {
    mode: input.mode,
    destination_ids: input.destination_ids,
    routing_label_key: input.routing_label_key ?? null,
  };
}

export const campaignNotificationsField = notificationsBlock
  .optional()
  .describe(
    "Alert routing saved together with the campaign: `mode`, `destination_ids`, `routing_label_key` — same meaning as in `set_campaign_alert_overrides`. The block REPLACES the whole routing: an omitted `destination_ids` means none and an omitted `routing_label_key` clears it. Omit the block to keep the current routing (update) or inherit the org defaults (create). Needs the alert_notifications.manage permission; the whole request is rejected before anything is written if the block is invalid."
  );
