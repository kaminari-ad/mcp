/**
 * Tool: `list_webhook_event_types` — catalog of events to subscribe to.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { WebhookEventCatalogEntry } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListWebhookEventTypesInputShape = {} as const;
type ListWebhookEventTypesInputShape = typeof ListWebhookEventTypesInputShape;

export interface ListWebhookEventTypesOutput {
  readonly items: readonly WebhookEventCatalogEntry[];
  readonly total: number;
}

export const listWebhookEventTypesTool: Tool<
  ListWebhookEventTypesInputShape,
  ListWebhookEventTypesOutput
> = {
  name: "list_webhook_event_types",
  description:
    "List the catalog of event types a webhook can subscribe to (e.g. `scan.done`, `alert.opened`, `campaign.run.completed`) with their human description.",
  annotations: {
    title: "List Webhook Event Types",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListWebhookEventTypesInputShape),
  handler: async (_input, ctx): Promise<Result<ListWebhookEventTypesOutput, ToolError>> => {
    const result = await ctx.api.listWebhookEventTypes();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
