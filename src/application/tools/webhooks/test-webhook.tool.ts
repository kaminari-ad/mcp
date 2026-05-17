/**
 * Tool: `test_webhook` — fire a synthetic test event to a webhook
 * endpoint so the operator can verify they receive it.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const TestWebhookInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID."),
} as const;
type TestWebhookInputShape = typeof TestWebhookInputShape;

export interface TestWebhookOutput {
  readonly dispatched: true;
}

export const testWebhookTool: Tool<TestWebhookInputShape, TestWebhookOutput> = {
  name: "test_webhook",
  description:
    "Dispatch a synthetic `webhook.test` event to the endpoint so the operator can verify their receiver works. Returns immediately; check `list_webhook_deliveries` for the outcome.",
  annotations: {
    title: "Test Webhook",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(TestWebhookInputShape),
  handler: async (input, ctx): Promise<Result<TestWebhookOutput, ToolError>> => {
    const result = await ctx.api.testWebhook(input.webhook_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ dispatched: true });
  },
};
