/**
 * Tool: `list_webhook_deliveries` — paginated delivery-attempt log
 * for one webhook. Useful for debugging "did Kaminari.Ad try to call me?"
 */

import { z } from "zod";

import type {
  DeliveryAttemptResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListWebhookDeliveriesInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID."),
  success: z
    .boolean()
    .optional()
    .describe("Filter to delivered (true) or failed (false) attempts only."),
  from_ts: z
    .string()
    .datetime({ offset: true })
    .optional()
    .describe("ISO 8601 datetime (with offset), inclusive lower bound on attempt time."),
  to_ts: z
    .string()
    .datetime({ offset: true })
    .optional()
    .describe("ISO 8601 datetime (with offset), inclusive upper bound."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListWebhookDeliveriesInputShape = typeof ListWebhookDeliveriesInputShape;

export type ListWebhookDeliveriesOutput = PaginatedResponse<DeliveryAttemptResponse>;

export const listWebhookDeliveriesTool: Tool<
  ListWebhookDeliveriesInputShape,
  ListWebhookDeliveriesOutput
> = {
  name: "list_webhook_deliveries",
  description:
    "List delivery attempts for one webhook endpoint with event type, status (pending / delivered / failed), HTTP response status if any, and attempt timestamp. Filter by `success` and / or a `from_ts` / `to_ts` range. Paginated.",
  annotations: {
    title: "List Webhook Deliveries",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListWebhookDeliveriesInputShape),
  handler: async (input, ctx): Promise<Result<ListWebhookDeliveriesOutput, ToolError>> => {
    const filters = {
      page: input.page,
      limit: input.limit,
      ...(input.success !== undefined ? { success: input.success } : {}),
      ...(input.from_ts !== undefined ? { from_ts: input.from_ts } : {}),
      ...(input.to_ts !== undefined ? { to_ts: input.to_ts } : {}),
    };
    const result = await ctx.api.listWebhookDeliveries(input.webhook_id, filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
