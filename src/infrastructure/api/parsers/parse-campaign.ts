/**
 * Parsers for the `/api/v1/campaigns` family.
 */

import type {
  ApiError,
  CampaignResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function b(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function sOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}
function strArr(v: unknown): readonly string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
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
export function parseCampaign(raw: unknown): Result<CampaignResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed campaign response" });
  }
  const id = raw["id"];
  if (typeof id !== "string") {
    return err({ kind: "upstream", detail: "campaign: id required" });
  }
  const groupId = raw["group_id"];
  if (typeof groupId !== "string") {
    return err({ kind: "upstream", detail: "campaign: group_id required" });
  }
  return ok({
    id,
    name: s(raw["name"]),
    campaign_type: s(raw["campaign_type"], "url"),
    url: s(raw["url"]),
    ad_tag: sOrNull(raw["ad_tag"]),
    country_codes: [...strArr(raw["country_codes"])],
    group_id: groupId,
    labels: asLabels(raw["labels"]),
    policy_set_id: sOrNull(raw["policy_set_id"]),
    schedule_enabled: b(raw["schedule_enabled"], false),
    schedule_type: s(raw["schedule_type"], "manual"),
    is_archived: b(raw["is_archived"], false),
    created_at: s(raw["created_at"]),
    last_run_at: sOrNull(raw["last_run_at"]),
  });
}

/**
 *
 */
export function parseCampaignPage(
  raw: unknown
): Result<PaginatedResponse<CampaignResponse>, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed campaign page" });
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
    return err({ kind: "upstream", detail: "malformed campaign envelope" });
  }
  const parsed: CampaignResponse[] = [];
  for (const item of items) {
    const r = parseCampaign(item);
    if (r.isErr()) return err(r.error);
    parsed.push(r.value);
  }
  return ok({ items: parsed, total, page, limit });
}
