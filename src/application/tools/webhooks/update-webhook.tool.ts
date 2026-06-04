/**
 * Tool: `update_webhook` — patch url / event_types / active.
 */

import { z } from "zod";

import type { WebhookResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateWebhookInputShape = {
  webhook_id: z.string().uuid().describe("Webhook UUID."),
  url: z.string().url().optional().describe("New endpoint URL."),
  description: z.string().max(256).optional().describe("New human-readable label."),
  event_types: z
    .array(z.string())
    .max(50)
    .optional()
    .describe("Replace the subscribed-event-types list."),
  campaign_ids: z
    .array(z.string().uuid())
    .optional()
    .describe("Restrict deliveries to these campaign UUIDs (replaces the current set)."),
  clear_campaign_ids: z
    .boolean()
    .optional()
    .describe(
      "Set true to remove the campaign restriction so the webhook fires for all campaigns."
    ),
  is_active: z.boolean().optional().describe("Enable / disable delivery."),
} as const;
type UpdateWebhookInputShape = typeof UpdateWebhookInputShape;

export type UpdateWebhookOutput = WebhookResponse;

export const updateWebhookTool: Tool<UpdateWebhookInputShape, UpdateWebhookOutput> = {
  name: "update_webhook",
  description:
    "Update a webhook endpoint's URL, event-type subscriptions, and/or active flag. Signing secret is NOT rotated by this call — use `rotate_webhook_secret` for that.",
  annotations: {
    title: "Update Webhook",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateWebhookInputShape),
  handler: async (input, ctx): Promise<Result<UpdateWebhookOutput, ToolError>> => {
    const body = {
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.event_types !== undefined ? { event_types: input.event_types } : {}),
      ...(input.campaign_ids !== undefined ? { campaign_ids: input.campaign_ids } : {}),
      ...(input.clear_campaign_ids !== undefined
        ? { clear_campaign_ids: input.clear_campaign_ids }
        : {}),
      ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
    };
    const result = await ctx.api.updateWebhook(input.webhook_id, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
