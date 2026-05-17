/**
 * Parser for `GET /api/v1/custom-rules`.
 *
 * The API returns the standard FastAPI paginated envelope
 * `{ items, total, page, limit, pages }`. The MCP tool surface only
 * needs the array of rules, so we accept either the envelope (current
 * production shape) or a bare array (defensive — covers a future
 * unwrapping breaking change). The pagination metadata is discarded;
 * if pagination ever matters for AI workflows, lift the DTO to
 * `PaginatedResponse<CustomRuleResponse>` like `listScans`.
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
  const items = unwrapItems(raw);
  if (items === undefined) {
    return err({ kind: "upstream", detail: "expected array (or {items:[]}) of custom-rules" });
  }
  const out: CustomRuleResponse[] = [];
  for (const item of items) {
    const r = parseCustomRule(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok(out);
}

/**
 * Accept either a bare `T[]` or the standard paginated envelope
 * `{ items: T[], ... }` and return the inner array. Returns
 * `undefined` for anything else so the caller can produce a useful
 * upstream error.
 */
function unwrapItems(raw: unknown): readonly unknown[] | undefined {
  if (Array.isArray(raw)) return raw;
  if (isStringRecord(raw) && Array.isArray(raw["items"])) return raw["items"];
  return undefined;
}
