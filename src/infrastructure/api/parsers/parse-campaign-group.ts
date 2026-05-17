/**
 * Parsers for the `/api/v1/campaign-groups` family.
 */

import type { ApiError, CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function asNumberOrNull(v: unknown): number | null {
  if (v === null) return null;
  return typeof v === "number" ? v : null;
}

/**
 *
 */
export function parseCampaignGroup(raw: unknown): Result<CampaignGroupResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed campaign-group response" });
  }
  const id = raw["id"];
  if (typeof id !== "string") {
    return err({ kind: "upstream", detail: "campaign-group: id required" });
  }
  return ok({
    id,
    name: asString(raw["name"], ""),
    is_default: asBool(raw["is_default"], false),
    is_archived: asBool(raw["is_archived"], false),
    schedule_paused: asBool(raw["schedule_paused"], false),
    created_at: asString(raw["created_at"], ""),
    campaign_count: asNumberOrNull(raw["campaign_count"]),
  });
}

/**
 * Parse the response of `GET /api/v1/campaign-groups`.
 *
 * Per OpenAPI this endpoint returns a **bare array** of
 * `CampaignGroupResponse`, NOT the standard FastAPI paginated envelope.
 * We accept the envelope shape defensively in case the API later wraps
 * it; production currently returns the bare form (verified via
 * prod-smoke 2026-05-17).
 */
export function parseCampaignGroupArray(
  raw: unknown
): Result<readonly CampaignGroupResponse[], ApiError> {
  const items = unwrapItems(raw);
  if (items === undefined) {
    return err({ kind: "upstream", detail: "expected array (or {items:[]}) of campaign-groups" });
  }
  const out: CampaignGroupResponse[] = [];
  for (const item of items) {
    const r = parseCampaignGroup(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok(out);
}

function unwrapItems(raw: unknown): readonly unknown[] | undefined {
  if (Array.isArray(raw)) return raw as readonly unknown[];
  if (isStringRecord(raw)) {
    const items = raw["items"];
    if (Array.isArray(items)) return items as readonly unknown[];
  }
  return undefined;
}
