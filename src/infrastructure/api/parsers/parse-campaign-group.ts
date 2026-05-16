/**
 * Parsers for the `/api/v1/campaign-groups` family.
 */

import type {
  ApiError,
  CampaignGroupResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
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
 *
 */
export function parseCampaignGroupPage(
  raw: unknown
): Result<PaginatedResponse<CampaignGroupResponse>, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed campaign-group page" });
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
    return err({ kind: "upstream", detail: "malformed campaign-group envelope" });
  }
  const parsed: CampaignGroupResponse[] = [];
  for (const item of items) {
    const r = parseCampaignGroup(item);
    if (r.isErr()) return err(r.error);
    parsed.push(r.value);
  }
  return ok({ items: parsed, total, page, limit });
}
