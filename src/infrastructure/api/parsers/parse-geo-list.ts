/**
 * Parser for `GET /api/v1/geos` — top-level array of countries.
 *
 * API shape per OpenAPI: `{ country_code, name, region, tier }`.
 */

import type { ApiError, GeoResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/**
 *
 */
export function parseGeoList(raw: unknown): Result<readonly GeoResponse[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "malformed /api/v1/geos response" });
  }
  const parsed: GeoResponse[] = [];
  for (const item of raw) {
    if (!isStringRecord(item)) {
      return err({ kind: "upstream", detail: "malformed geo item" });
    }
    const code = item["country_code"];
    if (typeof code !== "string") {
      return err({ kind: "upstream", detail: "geo: country_code required" });
    }
    parsed.push({
      country_code: code,
      name: s(item["name"]),
      region: s(item["region"]),
      tier: s(item["tier"]),
    });
  }
  return ok(parsed);
}
