/**
 * Tool: `create_webhook` — register a new HTTP endpoint for events.
 *
 * Returns the wrapped `{ webhook, secret }` envelope — `secret` is the
 * HMAC-SHA256 signing secret shown exactly once. The caller MUST
 * persist it; the server stores only a hash.
 */

import { z } from "zod";

import type { WebhookCreatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CreateWebhookInputShape = {
  url: z.string().url().describe("HTTPS endpoint URL."),
  description: z.string().max(200).default("").describe("Free-form label shown in the dashboard."),
  event_types: z
    .array(z.string())
    .min(0)
    .max(50)
    .default([])
    .describe(
      "Event-type slugs to subscribe to (see `list_webhook_event_types`). Empty array = subscribe to ALL events."
    ),
  campaign_ids: z
    .array(z.string().uuid())
    .max(50)
    .default([])
    .describe("Restrict to events from these campaigns. Empty array = events from every campaign."),
} as const;
type CreateWebhookInputShape = typeof CreateWebhookInputShape;

export type CreateWebhookOutput = WebhookCreatedResponse;

export const createWebhookTool: Tool<CreateWebhookInputShape, CreateWebhookOutput> = {
  name: "create_webhook",
  description:
    "Register a webhook endpoint for the chosen event types. Response is a `{ webhook, secret }` envelope — the HMAC-SHA256 SIGNING SECRET is returned once and the caller MUST store it to verify event signatures.",
  annotations: {
    title: "Create Webhook",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreateWebhookInputShape),
  handler: async (input, ctx): Promise<Result<CreateWebhookOutput, ToolError>> => {
    const result = await ctx.api.createWebhook({
      url: input.url,
      description: input.description,
      event_types: input.event_types,
      campaign_ids: input.campaign_ids,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
