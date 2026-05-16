/**
 * Parsers for `/api/v1/policy-sets` — list summary + full detail.
 */

import type {
  ApiError,
  PolicyEntry,
  PolicySetResponse,
  PolicySetSummary,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import { isStringRecord } from "./shared.js";

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function parsePolicyEntry(raw: unknown): PolicyEntry | undefined {
  if (!isStringRecord(raw)) return undefined;
  const slug = raw["tag_slug"];
  if (typeof slug !== "string") return undefined;
  const ccs = Array.isArray(raw["country_codes"])
    ? raw["country_codes"].filter((c): c is string => typeof c === "string")
    : [];
  return { tag_slug: slug, country_codes: ccs };
}

function summary(raw: Record<string, unknown>, id: string): PolicySetSummary {
  return {
    id,
    name: asString(raw["name"], ""),
    description: asString(raw["description"], ""),
    visibility: asString(raw["visibility"], "private"),
    is_approved: asBool(raw["is_approved"], false),
    created_at: asString(raw["created_at"], ""),
  };
}

export function parsePolicySetSummary(raw: unknown): Result<PolicySetSummary, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed policy-set" });
  const id = raw["id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: "policy-set: id required" });
  return ok(summary(raw, id));
}

export function parsePolicySet(raw: unknown): Result<PolicySetResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed policy-set" });
  const id = raw["id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: "policy-set: id required" });
  const entries: PolicyEntry[] = [];
  if (Array.isArray(raw["entries"])) {
    for (const e of raw["entries"]) {
      const parsed = parsePolicyEntry(e);
      if (parsed === undefined) {
        return err({ kind: "upstream", detail: "malformed policy entry" });
      }
      entries.push(parsed);
    }
  }
  return ok({ ...summary(raw, id), entries });
}

export function parsePolicySetList(
  raw: unknown
): Result<readonly PolicySetSummary[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "expected array of policy sets" });
  }
  const out: PolicySetSummary[] = [];
  for (const item of raw) {
    const r = parsePolicySetSummary(item);
    if (r.isErr()) return err(r.error);
    out.push(r.value);
  }
  return ok(out);
}
