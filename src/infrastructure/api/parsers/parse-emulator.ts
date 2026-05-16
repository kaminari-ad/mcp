/**
 * Parser for `GET /api/v1/emulators` — top-level array of catalog entries.
 */

import type { ApiError, EmulatorResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

/**
 *
 */
export function parseEmulatorList(raw: unknown): Result<readonly EmulatorResponse[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "expected array of emulators" });
  }
  const out: EmulatorResponse[] = [];
  for (const item of raw) {
    if (!isStringRecord(item)) {
      return err({ kind: "upstream", detail: "malformed emulator item" });
    }
    const id = item["id"];
    const displayName = item["display_name"];
    const category = item["category"];
    const browser = item["browser"];
    if (
      typeof id !== "string" ||
      typeof displayName !== "string" ||
      typeof category !== "string" ||
      typeof browser !== "string"
    ) {
      return err({ kind: "upstream", detail: "malformed emulator fields" });
    }
    out.push({ id, display_name: displayName, category, browser });
  }
  return ok(out);
}
