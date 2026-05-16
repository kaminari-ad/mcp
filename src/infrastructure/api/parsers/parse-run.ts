/**
 * Parsers for the `/api/v1/runs` family.
 */

import type {
  ApiError,
  PaginatedResponse,
  RunResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import { isStringRecord } from "./shared.js";

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}

export function parseRun(raw: unknown): Result<RunResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed run response" });
  }
  const id = raw["id"];
  const campaignId = raw["campaign_id"];
  if (typeof id !== "string" || typeof campaignId !== "string") {
    return err({ kind: "upstream", detail: "run: id and campaign_id required" });
  }
  return ok({
    id,
    campaign_id: campaignId,
    label: asString(raw["label"], ""),
    total: asNumber(raw["total"], 0),
    completed: asNumber(raw["completed"], 0),
    failed: asNumber(raw["failed"], 0),
    partial: asNumber(raw["partial"], 0),
    cancelled: asNumber(raw["cancelled"], 0),
    source: asString(raw["source"], ""),
    created_at: asString(raw["created_at"], ""),
  });
}

export function parseRunPage(raw: unknown): Result<PaginatedResponse<RunResponse>, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed run page" });
  }
  const items = raw["items"];
  const total = raw["total"];
  const page = raw["page"];
  const limit = raw["limit"];
  if (
    !Array.isArray(items) ||
    typeof total !== "number" ||
    typeof page !== "number" ||
    typeof limit !== "number"
  ) {
    return err({ kind: "upstream", detail: "malformed run envelope" });
  }
  const parsed: RunResponse[] = [];
  for (const item of items) {
    const r = parseRun(item);
    if (r.isErr()) return err(r.error);
    parsed.push(r.value);
  }
  return ok({ items: parsed, total, page, limit });
}
