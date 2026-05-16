/**
 * Parser for `GET /api/v1/tags` — paginated tag definitions with usage.
 */

import type {
  ApiError,
  PaginatedResponse,
  TagDefinitionResponse,
} from "../../../domain/ports/api-gateway.js";
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

export function parseTag(raw: unknown): Result<TagDefinitionResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed tag definition" });
  }
  const slug = raw["slug"];
  if (typeof slug !== "string") {
    return err({ kind: "upstream", detail: "tag: slug required" });
  }
  return ok({
    slug,
    category: asString(raw["category"], ""),
    source: asString(raw["source"], ""),
    display_name: asString(raw["display_name"], ""),
    description: asString(raw["description"], ""),
    is_system: asBool(raw["is_system"], false),
    severity: asString(raw["severity"], ""),
    scans_count: asNumber(raw["scans_count"], 0),
    rules_count: asNumber(raw["rules_count"], 0),
  });
}

export function parseTagPage(
  raw: unknown
): Result<PaginatedResponse<TagDefinitionResponse>, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed tag page" });
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
    return err({ kind: "upstream", detail: "malformed tag envelope" });
  }
  const out: TagDefinitionResponse[] = [];
  for (const item of items) {
    const r = parseTag(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok({ items: out, total, page, limit });
}
