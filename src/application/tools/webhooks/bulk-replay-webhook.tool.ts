/**
 * Tool: `bulk_replay_webhook` — replay every delivery attempt for an
 * endpoint within a time range.
 *
 * Wraps `POST /api/v1/webhooks/{endpoint_id}/replay`. The API replays
 * by `[from_ts, to_ts]` window, NOT by explicit attempt id list.
 */

import { z } from "zod";

import type { BulkReplayResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const BulkReplayWebhookInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID."),
  from_ts: z
    .string()
    .datetime()
    .describe("ISO-8601 lower bound (inclusive) of the time window to replay."),
  to_ts: z
    .string()
    .datetime()
    .describe("ISO-8601 upper bound (exclusive) of the time window to replay."),
} as const;
type BulkReplayWebhookInputShape = typeof BulkReplayWebhookInputShape;

export type BulkReplayWebhookOutput = BulkReplayResponse;

export const bulkReplayWebhookTool: Tool<BulkReplayWebhookInputShape, BulkReplayWebhookOutput> = {
  name: "bulk_replay_webhook",
  description:
    "Replay every delivery attempt for this webhook endpoint that landed in [from_ts, to_ts). Returns `{ replayed, skipped }` counts. Use to recover after a downstream outage — every event in the window is re-fired.",
  annotations: {
    title: "Bulk Replay Webhook",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(BulkReplayWebhookInputShape),
  handler: async (input, ctx): Promise<Result<BulkReplayWebhookOutput, ToolError>> => {
    const result = await ctx.api.bulkReplayWebhook(input.webhook_id, {
      from_ts: input.from_ts,
      to_ts: input.to_ts,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
