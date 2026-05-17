/**
 * Parsers for `/api/v1/webhooks` — list, single item, and create
 * response.
 *
 * `POST /api/v1/webhooks` and `POST .../{id}/rotate-secret` both
 * return the envelope `{ webhook: WebhookResponse, secret: string }`
 * — the secret is shown exactly once.
 */

import type {
  ApiError,
  WebhookCreatedResponse,
  WebhookResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
function sOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}
function b(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function strArr(v: unknown): readonly string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}
function obj(v: unknown): Readonly<Record<string, unknown>> {
  return isStringRecord(v) ? v : {};
}

function buildWebhook(raw: Record<string, unknown>, id: string): WebhookResponse {
  return {
    id,
    url: s(raw["url"], ""),
    description: s(raw["description"], ""),
    event_types: [...strArr(raw["event_types"])],
    campaign_ids: [...strArr(raw["campaign_ids"])],
    is_active: b(raw["is_active"], true),
    disabled_reason: sOrNull(raw["disabled_reason"]),
    disabled_at: sOrNull(raw["disabled_at"]),
    health: obj(raw["health"]) as WebhookResponse["health"],
    created_at: s(raw["created_at"], ""),
    updated_at: s(raw["updated_at"], ""),
  };
}

/**
 *
 */
export function parseWebhook(raw: unknown): Result<WebhookResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed webhook" });
  const id = raw["id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: "webhook: id required" });
  return ok(buildWebhook(raw, id));
}

/**
 *
 */
export function parseWebhookList(raw: unknown): Result<readonly WebhookResponse[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "expected array of webhooks" });
  }
  const out: WebhookResponse[] = [];
  for (const item of raw) {
    const r = parseWebhook(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok(out);
}

/**
 *
 */
export function parseWebhookCreated(raw: unknown): Result<WebhookCreatedResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed webhook-created response" });
  }
  const wh = raw["webhook"];
  const secret = raw["secret"];
  if (!isStringRecord(wh) || typeof secret !== "string") {
    return err({
      kind: "upstream",
      detail: "webhook-created: { webhook, secret } envelope required",
    });
  }
  const id = wh["id"];
  if (typeof id !== "string") {
    return err({ kind: "upstream", detail: "webhook-created: webhook.id required" });
  }
  const result: WebhookCreatedResponse = { webhook: buildWebhook(wh, id), secret };
  return ok(result);
}
