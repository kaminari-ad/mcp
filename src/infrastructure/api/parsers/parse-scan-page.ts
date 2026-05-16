/**
 * Parser for `GET /api/v1/scans` — paginated brief-scan envelope.
 */

import type {
  ApiError,
  PaginatedResponse,
  ScanBriefResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import { isStringRecord } from "./shared.js";

export function parseScanPage(
  raw: unknown
): Result<PaginatedResponse<ScanBriefResponse>, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed /api/v1/scans page" });
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
    return err({ kind: "upstream", detail: "malformed /api/v1/scans envelope" });
  }
  const parsed: ScanBriefResponse[] = [];
  for (const item of items) {
    if (!isStringRecord(item)) {
      return err({ kind: "upstream", detail: "malformed scan item" });
    }
    const id = item["id"];
    const url = item["url"];
    const cc = item["country_code"];
    const status = item["status"];
    const createdAt = item["created_at"];
    if (
      typeof id !== "string" ||
      typeof url !== "string" ||
      typeof cc !== "string" ||
      typeof status !== "string" ||
      typeof createdAt !== "string"
    ) {
      return err({ kind: "upstream", detail: "malformed scan item fields" });
    }
    parsed.push({ id, url, country_code: cc, status, created_at: createdAt });
  }
  return ok({ items: parsed, total, page, limit });
}
