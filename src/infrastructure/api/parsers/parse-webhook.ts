/**
 * Parsers for `/api/v1/webhooks`.
 *
 * `POST /api/v1/webhooks` and `POST /webhooks/{id}/rotate-secret`
 * return the envelope `{ webhook: WebhookResponse, secret: string }`
 * — the secret is shown exactly once on creation / rotation.
 *
 * `POST /api/v1/webhooks/{id}/test` returns `TestWebhookResponse`
 * synchronously (success + status + elapsed + error + body).
 */

import { z } from "zod";

import type {
  ApiError,
  TestWebhookResponse,
  WebhookCreatedResponse,
  WebhookResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const WebhookSchema = schemas.WebhookResponse.pick({
  id: true,
  url: true,
  description: true,
  event_types: true,
  campaign_ids: true,
  is_active: true,
  disabled_reason: true,
  disabled_at: true,
  health: true,
  created_at: true,
  updated_at: true,
}).strip();

const WebhookListSchema = z.array(WebhookSchema);

const WebhookCreatedSchema = z
  .object({
    webhook: WebhookSchema,
    secret: z.string(),
  })
  .strip();

const TestWebhookResponseSchema = schemas.TestWebhookResponse.pick({
  success: true,
  response_status: true,
  elapsed_ms: true,
  error_code: true,
  response_body: true,
}).strip();

export const parseWebhook = (raw: unknown): Result<WebhookResponse, ApiError> =>
  parseWithSchema(WebhookSchema, raw, "webhook") as Result<WebhookResponse, ApiError>;

export const parseWebhookList = (raw: unknown): Result<readonly WebhookResponse[], ApiError> =>
  parseWithSchema(WebhookListSchema, raw, "webhooks") as Result<
    readonly WebhookResponse[],
    ApiError
  >;

export const parseWebhookCreated = (raw: unknown): Result<WebhookCreatedResponse, ApiError> =>
  parseWithSchema(WebhookCreatedSchema, raw, "webhook-created") as Result<
    WebhookCreatedResponse,
    ApiError
  >;

export const parseTestWebhookResponse = (raw: unknown): Result<TestWebhookResponse, ApiError> =>
  parseWithSchema(TestWebhookResponseSchema, raw, "test-webhook") as Result<
    TestWebhookResponse,
    ApiError
  >;
