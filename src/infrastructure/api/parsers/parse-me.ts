/**
 * Parser for `GET /api/v1/account`. Returns `Err` with the upstream
 * `ApiError` kind on any shape mismatch — the API is supposed to keep
 * its contract; a mismatch is treated as a 5xx-equivalent.
 */

import type { ApiError, MeResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import { isStringRecord } from "./shared.js";

export function parseMe(raw: unknown): Result<MeResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed /api/v1/account response" });
  }
  const userId = raw["user_id"];
  const orgId = raw["organization_id"];
  const email = raw["email"];
  const displayName = raw["display_name"];
  const perms = raw["permissions"];
  if (
    typeof userId !== "string" ||
    typeof orgId !== "string" ||
    typeof email !== "string" ||
    typeof displayName !== "string" ||
    !Array.isArray(perms) ||
    !perms.every((p): p is string => typeof p === "string")
  ) {
    return err({ kind: "upstream", detail: "malformed /api/v1/account fields" });
  }
  return ok({
    user_id: userId,
    organization_id: orgId,
    email,
    display_name: displayName,
    permissions: perms,
  });
}
