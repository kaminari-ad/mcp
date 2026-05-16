/**
 * Parser for `GET /api/v1/geos` — top-level array of countries.
 */

import type { ApiError, GeoResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import { isStringRecord } from "./shared.js";

export function parseGeoList(raw: unknown): Result<readonly GeoResponse[], ApiError> {
  if (!Array.isArray(raw)) {
    return err({ kind: "upstream", detail: "malformed /api/v1/geos response" });
  }
  const parsed: GeoResponse[] = [];
  for (const item of raw) {
    if (!isStringRecord(item)) {
      return err({ kind: "upstream", detail: "malformed geo item" });
    }
    const code = item["code"];
    const name = item["name"];
    const continent = item["continent"];
    const emoji = item["emoji"];
    if (
      typeof code !== "string" ||
      typeof name !== "string" ||
      typeof continent !== "string" ||
      typeof emoji !== "string"
    ) {
      return err({ kind: "upstream", detail: "malformed geo item fields" });
    }
    parsed.push({ code, name, continent, emoji });
  }
  return ok(parsed);
}
