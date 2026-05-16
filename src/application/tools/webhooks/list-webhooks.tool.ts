/**
 * Tool: `list_webhooks` — registered webhook endpoints.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { WebhookResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListWebhooksInputShape = {} as const;
type ListWebhooksInputShape = typeof ListWebhooksInputShape;

export interface ListWebhooksOutput {
  readonly items: readonly WebhookResponse[];
  readonly total: number;
}

export const listWebhooksTool: Tool<ListWebhooksInputShape, ListWebhooksOutput> = {
  name: "list_webhooks",
  description:
        "List the organization's registered webhook endpoints with their URL, subscribed event types, and active flag.",
      annotations: { title: "List Webhooks", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(ListWebhooksInputShape),
  handler: async (_input, ctx): Promise<Result<ListWebhooksOutput, ToolError>> => {
    const result = await ctx.api.listWebhooks();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
