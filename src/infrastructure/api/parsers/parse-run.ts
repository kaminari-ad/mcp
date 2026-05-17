/**
 * Parsers for the `/api/v1/runs` family. `RunResponse` has no
 * paginated envelope of its own — pages always go through
 * `parsePageOf(parseRun)`.
 */

import type { ApiError, RunResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function n(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}

/**
 *
 */
export function parseRun(raw: unknown): Result<RunResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed run response" });
  }
  const id = raw["id"];
  const campaignId = raw["campaign_id"];
  if (typeof id !== "string" || typeof campaignId !== "string") {
    return err({ kind: "upstream", detail: "run: id and campaign_id required" });
  }
  return ok({
    id,
    campaign_id: campaignId,
    label: s(raw["label"]),
    total: n(raw["total"]),
    completed: n(raw["completed"]),
    failed: n(raw["failed"]),
    partial: n(raw["partial"]),
    cancelled: n(raw["cancelled"]),
    source: s(raw["source"], "api") === "ui" ? "ui" : "api",
    created_at: s(raw["created_at"]),
  });
}
