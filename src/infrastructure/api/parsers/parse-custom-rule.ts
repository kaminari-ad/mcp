/**
 * Parser for `GET /api/v1/custom-rules` — list returns a top-level
 * array (not paginated envelope per OpenAPI).
 */

import type { ApiError, CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function b(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/**
 *
 */
export function parseCustomRule(raw: unknown): Result<CustomRuleResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed custom-rule response" });
  }
  const id = raw["id"];
  if (typeof id !== "string") {
    return err({ kind: "upstream", detail: "custom-rule: id required" });
  }
  const orgId = raw["organization_id"];
  if (typeof orgId !== "string") {
    return err({ kind: "upstream", detail: "custom-rule: organization_id required" });
  }
  const config = isStringRecord(raw["config"]) ? raw["config"] : {};
  return ok({
    id,
    organization_id: orgId,
    name: s(raw["name"]),
    tag_slug: s(raw["tag_slug"]),
    rule_type: s(raw["rule_type"]),
    config,
    target: s(raw["target"], "page"),
    is_active: b(raw["is_active"], true),
    created_at: s(raw["created_at"]),
  });
}

/**
 *
 */
export function parseCustomRuleArray(
  raw: unknown
): Result<readonly CustomRuleResponse[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "expected array of custom-rules" });
  }
  const out: CustomRuleResponse[] = [];
  for (const item of raw) {
    const r = parseCustomRule(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok(out);
}
