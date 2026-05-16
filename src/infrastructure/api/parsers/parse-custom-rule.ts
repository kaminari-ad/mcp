/**
 * Parser for `GET /api/v1/custom-rules` (page + item).
 */

import type {
  ApiError,
  CustomRuleResponse,
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

export function parseCustomRule(raw: unknown): Result<CustomRuleResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed custom-rule response" });
  }
  const id = raw["id"];
  if (typeof id !== "string") {
    return err({ kind: "upstream", detail: "custom-rule: id required" });
  }
  const config = isStringRecord(raw["config"]) ? raw["config"] : {};
  return ok({
    id,
    name: asString(raw["name"], ""),
    tag_slug: asString(raw["tag_slug"], ""),
    rule_type: asString(raw["rule_type"], ""),
    config,
    target: asString(raw["target"], "page"),
    is_active: asBool(raw["is_active"], true),
    created_at: asString(raw["created_at"], ""),
  });
}

export function parseCustomRulePage(
  raw: unknown
): Result<PaginatedResponse<CustomRuleResponse>, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed custom-rule page" });
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
    return err({ kind: "upstream", detail: "malformed custom-rule envelope" });
  }
  const out: CustomRuleResponse[] = [];
  for (const item of items) {
    const r = parseCustomRule(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok({ items: out, total, page, limit });
}
