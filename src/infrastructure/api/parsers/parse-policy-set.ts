/**
 * Parsers for `/api/v1/policy-sets` — list and detail share the
 * `PolicySetResponse` shape per OpenAPI.
 */

import type {
  ApiError,
  PolicyEntryResponse,
  PolicySetResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function b(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function strArr(v: unknown): readonly string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function parseEntry(raw: unknown): PolicyEntryResponse | undefined {
  if (!isStringRecord(raw)) return undefined;
  const id = raw["id"];
  const slug = raw["tag_slug"];
  if (typeof id !== "string" || typeof slug !== "string") return undefined;
  return { id, tag_slug: slug, country_codes: [...strArr(raw["country_codes"])] };
}

/**
 *
 */
export function parsePolicySet(raw: unknown): Result<PolicySetResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed policy-set" });
  const id = raw["id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: "policy-set: id required" });
  const orgId = raw["organization_id"];
  if (typeof orgId !== "string") {
    return err({ kind: "upstream", detail: "policy-set: organization_id required" });
  }
  const entries: PolicyEntryResponse[] = [];
  if (Array.isArray(raw["entries"])) {
    for (const e of raw["entries"]) {
      const parsed = parseEntry(e);
      if (parsed === undefined) {
        return err({ kind: "upstream", detail: "malformed policy entry" });
      }
      entries.push(parsed);
    }
  }
  return ok({
    id,
    name: s(raw["name"]),
    description: s(raw["description"]),
    organization_id: orgId,
    visibility: s(raw["visibility"], "private"),
    is_approved: b(raw["is_approved"], false),
    entries,
    created_at: s(raw["created_at"]),
  });
}

/**
 *
 */
export function parsePolicySetList(raw: unknown): Result<readonly PolicySetResponse[], ApiError> {
  // API returns the FastAPI paginated envelope `{ items, total, page,
  // limit, pages }`. The MCP tool only needs the inner array — pagination
  // metadata is discarded. Bare-array shape is accepted as a defensive
  // fallback so a future API change that unwraps the envelope does not
  // break the parser.
  const items = unwrapItems(raw);
  if (items === undefined) {
    return err({ kind: "upstream", detail: "expected array (or {items:[]}) of policy sets" });
  }
  const out: PolicySetResponse[] = [];
  for (const item of items) {
    const r = parsePolicySet(item);
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
