/**
 * Parser for `GET /api/v1/billing`. Heavy defensive defaulting.
 */

import type { ApiError, BillingSummaryResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function b(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function n(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}
function sOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}
function nOrNull(v: unknown): number | null {
  if (v === null) return null;
  return typeof v === "number" ? v : null;
}

/**
 *
 */
export function parseBillingSummary(raw: unknown): Result<BillingSummaryResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed billing summary" });
  }
  const result: BillingSummaryResponse = {
    balance_micros: n(raw["balance_micros"]),
    plan_id: sOrNull(raw["plan_id"]),
    plan_name: sOrNull(raw["plan_name"]),
    checks_per_period: nOrNull(raw["checks_per_period"]),
    checks_used: nOrNull(raw["checks_used"]),
    period_start: sOrNull(raw["period_start"]),
    period_end: sOrNull(raw["period_end"]),
    price_per_extra_check_micros: n(raw["price_per_extra_check_micros"]),
    is_suspended: b(raw["is_suspended"], false),
    can_create_scan: b(raw["can_create_scan"], true),
    block_reason: sOrNull(raw["block_reason"]),
    billing_mode: s(raw["billing_mode"], "prepaid"),
  };
  return ok(result);
}
