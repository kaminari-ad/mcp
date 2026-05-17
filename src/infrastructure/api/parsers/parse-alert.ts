/**
 * Parser for `GET /api/v1/alerts` — paginated alert list.
 */

import type {
  AlertResponse,
  ApiError,
  PaginatedResponse,
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

/**
 *
 */
export function parseAlert(raw: unknown): Result<AlertResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed alert" });
  const id = raw["id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: "alert: id required" });
  return ok({
    id,
    scan_id: s(raw["scan_id"], ""),
    campaign_id: s(raw["campaign_id"], ""),
    policy_set_id: sOrNull(raw["policy_set_id"]),
    violation_rule_id: sOrNull(raw["violation_rule_id"]),
    tag_slug: s(raw["tag_slug"], ""),
    tag_display_name: s(raw["tag_display_name"], ""),
    country_code: s(raw["country_code"], ""),
    status: s(raw["status"], ""),
    closed_by: sOrNull(raw["closed_by"]),
    scan_url: s(raw["scan_url"], ""),
    offer_url: s(raw["offer_url"], ""),
    created_at: s(raw["created_at"], ""),
    updated_at: s(raw["updated_at"], ""),
  });
}

/**
 *
 */
export function parseAlertPage(raw: unknown): Result<PaginatedResponse<AlertResponse>, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed alert page" });
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
    return err({ kind: "upstream", detail: "malformed alert envelope" });
  }
  const out: AlertResponse[] = [];
  for (const item of items) {
    const r = parseAlert(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok({ items: out, total, page, limit });
}
