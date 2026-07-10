/**
 * Parser for `GET /api/v1/scans` — paginated brief-scan envelope.
 */

import type {
  ApiError,
  PaginatedResponse,
  ScanBriefResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parsePagedWithItemSchema } from "./parse-with-schema.js";

const ScanBriefSchema = schemas.ScanBriefResponse.pick({
  id: true,
  url: true,
  country_code: true,
  status: true,
  offer_url: true,
  screenshot_url: true,
  report_url: true,
  public_report_url: true,
  labels: true,
  elapsed_ms: true,
  campaign_id: true,
  campaign_name: true,
  is_ad_tag: true,
  is_vast: true,
  created_at: true,
}).strip();

export const parseScanPage = (
  raw: unknown
): Result<PaginatedResponse<ScanBriefResponse>, ApiError> =>
  parsePagedWithItemSchema(ScanBriefSchema, raw, "scans") as Result<
    PaginatedResponse<ScanBriefResponse>,
    ApiError
  >;
