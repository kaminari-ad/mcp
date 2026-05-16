/**
 * Tool: `bulk_replay_webhook` — replay many delivery attempts at once
 * (all failed, or an explicit list).
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const BulkReplayWebhookInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID."),
  attempt_ids: z
    .array(z.string().uuid())
    .max(1000)
    .optional()
    .describe("Explicit attempt UUIDs to replay. Omit to replay every recent FAILED attempt for the endpoint."),
} as const;
type BulkReplayWebhookInputShape = typeof BulkReplayWebhookInputShape;

export interface BulkReplayWebhookOutput {
  readonly replayed_count: number;
}

export const bulkReplayWebhookTool: Tool<BulkReplayWebhookInputShape, BulkReplayWebhookOutput> = {
  name: "bulk_replay_webhook",
  description:
    "Replay many webhook deliveries at once. With `attempt_ids` — replay exactly those. Without — replay every recent FAILED attempt for the endpoint. Returns the count queued.",
  annotations: {
    title: "Bulk Replay Webhook",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(BulkReplayWebhookInputShape),
  handler: async (input, ctx): Promise<Result<BulkReplayWebhookOutput, ToolError>> => {
    const body =
      input.attempt_ids !== undefined ? { attempt_ids: input.attempt_ids } : {};
    const result = await ctx.api.bulkReplayWebhook(input.webhook_id, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
