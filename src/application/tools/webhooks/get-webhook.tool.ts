/**
 * Tool: `get_webhook` — one webhook by UUID.
 */

import { z } from "zod";

import type { WebhookResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetWebhookInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID."),
} as const;
type GetWebhookInputShape = typeof GetWebhookInputShape;

export type GetWebhookOutput = WebhookResponse;

export const getWebhookTool: Tool<GetWebhookInputShape, GetWebhookOutput> = {
  name: "get_webhook",
  description: "Get one webhook endpoint by UUID with URL, subscribed event types, active flag.",
  annotations: {
    title: "Get Webhook",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetWebhookInputShape),
  handler: async (input, ctx): Promise<Result<GetWebhookOutput, ToolError>> => {
    const result = await ctx.api.getWebhook(input.webhook_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
