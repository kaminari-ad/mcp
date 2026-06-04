/**
 * Parser for `GET /api/v1/runs/{run_id}/scans` — paginated tile-scan
 * envelope. The endpoint deliberately returns the slimmer
 * `ScanTileResponse` (designed for the run-detail UI's tile grid),
 * NOT the full `ScanBriefResponse` from `/scans`. Use this parser
 * for the run-scoped scan list; the regular `/scans` list still uses
 * `parseScanPage`.
 *
 * Drift history: shipping v0.1.5 wired `parseScanPage` here, which
 * required `url` — but `ScanTileResponse` omits it by design. Result:
 * `malformed scans page: items.0.url: Required` on every real call.
 * Same drift class as `parsePolicySetList` vs full `PolicySetResponse`
 * (fixed in v0.1.1).
 */

import type {
  ApiError,
  PaginatedResponse,
  ScanTileResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parsePagedWithItemSchema } from "./parse-with-schema.js";

const ScanTileSchema = schemas.ScanTileResponse.pick({
  id: true,
  country_code: true,
  status: true,
  offer_url: true,
  screenshot_url: true,
  report_url: true,
  public_report_url: true,
  elapsed_ms: true,
  error: true,
}).strip();

export const parseRunScanPage = (
  raw: unknown
): Result<PaginatedResponse<ScanTileResponse>, ApiError> =>
  parsePagedWithItemSchema(ScanTileSchema, raw, "run-scans") as Result<
    PaginatedResponse<ScanTileResponse>,
    ApiError
  >;
