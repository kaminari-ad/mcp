/**
 * Parser for `GET /api/v1/account/api-keys` — array of api-key metadata
 * (never the full secret; only the prefix).
 */

import type { ApiError, ApiKeyResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
function asStringOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}

/**
 *
 */
export function parseApiKeyList(raw: unknown): Result<readonly ApiKeyResponse[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "expected array of api-keys" });
  }
  const out: ApiKeyResponse[] = [];
  for (const item of raw) {
    if (!isStringRecord(item)) {
      return err({ kind: "upstream", detail: "malformed api-key item" });
    }
    const id = item["id"];
    if (typeof id !== "string") {
      return err({ kind: "upstream", detail: "api-key: id required" });
    }
    out.push({
      id,
      key_prefix: asString(item["key_prefix"], ""),
      name: asString(item["name"], ""),
      expires_at: asStringOrNull(item["expires_at"]),
      created_at: asString(item["created_at"], ""),
    });
  }
  return ok(out);
}
