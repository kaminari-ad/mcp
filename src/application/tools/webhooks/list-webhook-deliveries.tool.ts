/**
 * Tool: `list_webhook_deliveries` — paginated delivery-attempt log
 * for one webhook. Useful for debugging "did Kaminari try to call me?"
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type {
  PaginatedResponse,
  WebhookDeliveryAttemptResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListWebhookDeliveriesInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListWebhookDeliveriesInputShape = typeof ListWebhookDeliveriesInputShape;

export type ListWebhookDeliveriesOutput = PaginatedResponse<WebhookDeliveryAttemptResponse>;

export const listWebhookDeliveriesTool: Tool<
  ListWebhookDeliveriesInputShape,
  ListWebhookDeliveriesOutput
> = {
  name: "list_webhook_deliveries",
  description:
    "List delivery attempts for one webhook endpoint with event type, status (pending / delivered / failed), HTTP response status if any, and attempt timestamp. Paginated.",
  annotations: {
    title: "List Webhook Deliveries",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListWebhookDeliveriesInputShape),
  handler: async (input, ctx): Promise<Result<ListWebhookDeliveriesOutput, ToolError>> => {
    const result = await ctx.api.listWebhookDeliveries(input.webhook_id, {
      page: input.page,
      limit: input.limit,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
