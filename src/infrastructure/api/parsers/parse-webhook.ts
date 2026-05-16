/**
 * Parsers for `/api/v1/webhooks` — list item and create response.
 */

import type {
  ApiError,
  WebhookCreatedResponse,
  WebhookResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import { isStringRecord } from "./shared.js";

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function asStringArray(v: unknown): readonly string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function base(raw: Record<string, unknown>, id: string): WebhookResponse {
  return {
    id,
    url: asString(raw["url"], ""),
    event_types: asStringArray(raw["event_types"]),
    is_active: asBool(raw["is_active"], true),
    created_at: asString(raw["created_at"], ""),
  };
}

export function parseWebhook(raw: unknown): Result<WebhookResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed webhook" });
  const id = raw["id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: "webhook: id required" });
  return ok(base(raw, id));
}

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

export function parseWebhookCreated(raw: unknown): Result<WebhookCreatedResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed webhook-created response" });
  }
  const id = raw["id"];
  const signing = raw["signing_secret"];
  if (typeof id !== "string" || typeof signing !== "string") {
    return err({ kind: "upstream", detail: "webhook-created: id+signing_secret required" });
  }
  return ok({ ...base(raw, id), signing_secret: signing });
}
