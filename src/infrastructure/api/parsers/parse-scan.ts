/**
 * Parser for `GET /api/v1/scans/{id}` and the items returned by
 * `POST /api/v1/scans` and `POST /api/v1/scans/bulk`.
 *
 * Defensive subset — only the fields agents typically read. Nested
 * arrays (`redirect_chain`, `landings`, `classification`) are
 * deliberately ignored so a single field rename in those nested types
 * doesn't break this parser.
 */

import type { ApiError, ScanResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}

function asStringOrNull(v: unknown): string | null {
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
export function parseScan(raw: unknown): Result<ScanResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed scan response" });
  }
  const id = raw["id"];
  if (typeof id !== "string") {
    return err({ kind: "upstream", detail: "scan: id must be a string" });
  }
  return ok({
    id,
    url: asString(raw["url"], ""),
    country_code: asString(raw["country_code"], ""),
    emulator_id: asString(raw["emulator_id"], ""),
    status: asString(raw["status"], "") as ScanResponse["status"],
    offer_url: asString(raw["offer_url"], ""),
    screenshot_url: asString(raw["screenshot_url"], ""),
    ad_tag: asStringOrNull(raw["ad_tag"]),
    creative_screenshot_url: asString(raw["creative_screenshot_url"], ""),
    page_title: asString(raw["page_title"], ""),
    elapsed_ms: asNumber(raw["elapsed_ms"], 0),
    error: asString(raw["error"], ""),
    labels: asLabels(raw["labels"]),
    campaign_id: asStringOrNull(raw["campaign_id"]),
    campaign_name: asStringOrNull(raw["campaign_name"]),
    created_at: asString(raw["created_at"], ""),
    completed_at: asStringOrNull(raw["completed_at"]),
  });
}

/**
 *
 */
export function parseScanArray(raw: unknown): Result<readonly ScanResponse[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "expected array of scans" });
  }
  const out: ScanResponse[] = [];
  for (const item of raw) {
    const r = parseScan(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok(out);
}
