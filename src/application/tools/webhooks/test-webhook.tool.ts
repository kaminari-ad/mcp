/**
 * Tool: `test_webhook` — fire a synthetic event to a webhook endpoint
 * and return the receiver's response synchronously.
 *
 * Unlike a real production delivery (which goes through the outbox
 * and retries), this is a one-shot blocking call so the operator can
 * see immediately whether their receiver works.
 */

import { z } from "zod";

import type { TestWebhookResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const TestWebhookInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID."),
  event_type: z
    .string()
    .min(1)
    .max(100)
    .describe(
      "Event type slug whose sample payload to send (see `list_webhook_event_types` for the catalog)."
    ),
} as const;
type TestWebhookInputShape = typeof TestWebhookInputShape;

export type TestWebhookOutput = TestWebhookResponse;

export const testWebhookTool: Tool<TestWebhookInputShape, TestWebhookOutput> = {
  name: "test_webhook",
  description:
    "Dispatch a synthetic event with the sample payload for the given `event_type` to the webhook endpoint and return the receiver's response synchronously. Includes HTTP status, elapsed time, and a snippet of the response body so the operator can diagnose receiver bugs.",
  annotations: {
    title: "Test Webhook",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  inputSchema: z.object(TestWebhookInputShape),
  handler: async (input, ctx): Promise<Result<TestWebhookOutput, ToolError>> => {
    const result = await ctx.api.testWebhook(input.webhook_id, { event_type: input.event_type });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
