/**
 * Tool: `rotate_webhook_secret` — mint a new signing secret for a
 * webhook. Returns the FULL new secret once; the old secret is no
 * longer accepted on subsequent deliveries.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { WebhookCreatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const RotateWebhookSecretInputShape = {
  webhook_id: z.string().uuid().describe("Webhook endpoint UUID."),
} as const;
type RotateWebhookSecretInputShape = typeof RotateWebhookSecretInputShape;

export type RotateWebhookSecretOutput = WebhookCreatedResponse;

export const rotateWebhookSecretTool: Tool<
  RotateWebhookSecretInputShape,
  RotateWebhookSecretOutput
> = {
  name: "rotate_webhook_secret",
  description:
    "Generate a new signing secret for a webhook. The new secret is returned IN FULL once — tell the user to store it. Subsequent deliveries are signed with the new secret; the old one stops working immediately.",
  annotations: {
    title: "Rotate Webhook Secret",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(RotateWebhookSecretInputShape),
  handler: async (input, ctx): Promise<Result<RotateWebhookSecretOutput, ToolError>> => {
    const result = await ctx.api.rotateWebhookSecret(input.webhook_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
