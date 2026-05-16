/**
 * Parser for `GET /api/v1/tag-definitions` — top-level array of
 * `TagDefinitionWithStatsResponse`.
 */

import type { ApiError, TagDefinitionResponse } from "../../../domain/ports/api-gateway.js";
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

/**
 *
 */
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
    category: s(raw["category"]),
    source: s(raw["source"]),
    display_name: s(raw["display_name"]),
    description: s(raw["description"]),
    severity: s(raw["severity"]),
    is_system: b(raw["is_system"]),
    organization_id: sOrNull(raw["organization_id"]),
    show_in_public_report: b(raw["show_in_public_report"]),
    scans_count: n(raw["scans_count"]),
    rules_count: n(raw["rules_count"]),
  });
}

/**
 *
 */
export function parseTagDefinitionArray(
  raw: unknown
): Result<readonly TagDefinitionResponse[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "expected array of tag-definitions" });
  }
  const out: TagDefinitionResponse[] = [];
  for (const item of raw) {
    const r = parseTag(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok(out);
}
