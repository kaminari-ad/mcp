/**
 * Parser for `GET /api/v1/scans` — paginated brief-scan envelope.
 */

import type {
  ApiError,
  PaginatedResponse,
  ScanBriefResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function n(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}
function b(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function sOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}
function asLabels(v: unknown): Readonly<Record<string, string>> {
  if (!isStringRecord(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "string") out[k] = val;
  }
  return out;
}

/**
 *
 */
export function parseScanPage(
  raw: unknown
): Result<PaginatedResponse<ScanBriefResponse>, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed /api/v1/scans page" });
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
    return err({ kind: "upstream", detail: "malformed /api/v1/scans envelope" });
  }
  const parsed: ScanBriefResponse[] = [];
  for (const item of items) {
    if (!isStringRecord(item)) {
      return err({ kind: "upstream", detail: "malformed scan item" });
    }
    const id = item["id"];
    if (typeof id !== "string") {
      return err({ kind: "upstream", detail: "scan item: id required" });
    }
    parsed.push({
      id,
      url: s(item["url"]),
      country_code: s(item["country_code"]),
      status: s(item["status"]) as ScanBriefResponse["status"],
      offer_url: s(item["offer_url"]),
      screenshot_url: s(item["screenshot_url"]),
      labels: asLabels(item["labels"]),
      elapsed_ms: n(item["elapsed_ms"]),
      campaign_id: sOrNull(item["campaign_id"]),
      campaign_name: sOrNull(item["campaign_name"]),
      is_ad_tag: b(item["is_ad_tag"]),
      created_at: s(item["created_at"]),
    });
  }
  return ok({ items: parsed, total, page, limit });
}
