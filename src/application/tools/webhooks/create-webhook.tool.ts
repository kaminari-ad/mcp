/**
 * Tool: `create_webhook` — register a new HTTP endpoint for events.
 *
 * Returns the full record INCLUDING `signing_secret` — show this to the
 * user and tell them to store it; it's never returned again.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { WebhookCreatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CreateWebhookInputShape = {
  url: z.string().url().describe("HTTPS endpoint URL."),
  event_types: z
    .array(z.string())
    .min(1)
    .max(50)
    .describe("Event-type slugs to subscribe to (use `list_event_types` for the catalog)."),
  is_active: z.boolean().optional().describe("Activate immediately. Default: true."),
} as const;
type CreateWebhookInputShape = typeof CreateWebhookInputShape;

export type CreateWebhookOutput = WebhookCreatedResponse;

export const createWebhookTool: Tool<CreateWebhookInputShape, CreateWebhookOutput> = {
  name: "create_webhook",
  description:
        "Register a webhook endpoint for the chosen event types. Response includes the SIGNING SECRET — it is shown only this once; the caller must store it to verify event signatures.",
      annotations: { title: "Create Webhook", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  inputSchema: z.object(CreateWebhookInputShape),
  handler: async (input, ctx): Promise<Result<CreateWebhookOutput, ToolError>> => {
    const body = {
      url: input.url,
      event_types: input.event_types,
      ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
    };
    const result = await ctx.api.createWebhook(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
