/**
 * Tool: `replay_webhook_delivery` — re-fire ONE specific delivery
 * attempt (e.g. one that failed) by attempt-id.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ReplayWebhookDeliveryInputShape = {
  attempt_id: z.string().uuid().describe("Delivery-attempt UUID (from `list_webhook_deliveries`)."),
} as const;
type ReplayWebhookDeliveryInputShape = typeof ReplayWebhookDeliveryInputShape;

export interface ReplayWebhookDeliveryOutput {
  readonly queued: true;
}

export const replayWebhookDeliveryTool: Tool<
  ReplayWebhookDeliveryInputShape,
  ReplayWebhookDeliveryOutput
> = {
  name: "replay_webhook_delivery",
  description:
    "Queue a re-attempt for one specific webhook-delivery attempt by id. Useful when an endpoint was temporarily down. Result of the replay shows up as a new entry in `list_webhook_deliveries`.",
  annotations: {
    title: "Replay Webhook Delivery",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(ReplayWebhookDeliveryInputShape),
  handler: async (input, ctx): Promise<Result<ReplayWebhookDeliveryOutput, ToolError>> => {
    const result = await ctx.api.replayWebhookDelivery(input.attempt_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ queued: true });
  },
};
