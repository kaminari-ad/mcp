/**
 * Tool: `delete_webhook` — unregister an endpoint.
 *
 * No further events are delivered; in-flight retries are dropped.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const DeleteWebhookInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID to remove."),
} as const;
type DeleteWebhookInputShape = typeof DeleteWebhookInputShape;

export interface DeleteWebhookOutput {
  readonly deleted: true;
}

export const deleteWebhookTool: Tool<DeleteWebhookInputShape, DeleteWebhookOutput> = {
  name: "delete_webhook",
  description:
    "Unregister a webhook endpoint. No further events are delivered; in-flight retries are dropped. Past delivery history is preserved.",
  annotations: {
    title: "Delete Webhook",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(DeleteWebhookInputShape),
  handler: async (input, ctx): Promise<Result<DeleteWebhookOutput, ToolError>> => {
    const result = await ctx.api.deleteWebhook(input.webhook_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ deleted: true });
  },
};
