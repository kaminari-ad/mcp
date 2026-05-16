/**
 * Parser for `GET /api/v1/billing`. Lots of optional fields — heavy
 * defensive defaulting.
 */

import type { ApiError, BillingSummaryResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import { isStringRecord } from "./shared.js";

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}
function asStringOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}
function asNumberOrNull(v: unknown): number | null {
  if (v === null) return null;
  return typeof v === "number" ? v : null;
}

export function parseBillingSummary(raw: unknown): Result<BillingSummaryResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed billing summary" });
  }
  return ok({
    balance_micros: asNumber(raw["balance_micros"], 0),
    plan_name: asStringOrNull(raw["plan_name"]),
    checks_per_period: asNumberOrNull(raw["checks_per_period"]),
    checks_used: asNumberOrNull(raw["checks_used"]),
    period_start: asStringOrNull(raw["period_start"]),
    period_end: asStringOrNull(raw["period_end"]),
    is_suspended: asBool(raw["is_suspended"], false),
    can_create_scan: asBool(raw["can_create_scan"], true),
    block_reason: asStringOrNull(raw["block_reason"]),
    billing_mode: asString(raw["billing_mode"], "prepaid"),
  });
}
