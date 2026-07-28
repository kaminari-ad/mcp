/**
 * Parsers for `/api/v1/scans/{id}` (single scan detail) and
 * `POST /api/v1/scans/bulk` (array of scan detail responses).
 */

import { z } from "zod";

import type { ApiError, ScanResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const ScanSchema = schemas.ScanResponse.pick({
  id: true,
  url: true,
  country_code: true,
  emulator_id: true,
  status: true,
  offer_url: true,
  screenshot_url: true,
  report_url: true,
  public_report_url: true,
  ad_tag: true,
  vast_tag: true,
  creative_kind: true,
  video: true,
  creative_screenshot_url: true,
  page_title: true,
  elapsed_ms: true,
  error: true,
  labels: true,
  campaign_id: true,
  campaign_name: true,
  parent_scan_id: true,
  ad_discovery: true,
  slot_index: true,
  ad_kind: true,
  network: true,
  created_at: true,
  completed_at: true,
  repeat_index: true,
  repeat_total: true,
  repeat_session_id: true,
  repeat_scan_ids: true,
  retry_attempt: true,
  retry_max_attempts: true,
}).strip();

const ScanArraySchema = z.array(ScanSchema);

export const parseScan = (raw: unknown): Result<ScanResponse, ApiError> =>
  parseWithSchema(ScanSchema, raw, "scan") as Result<ScanResponse, ApiError>;

export const parseScanArray = (raw: unknown): Result<readonly ScanResponse[], ApiError> =>
  parseWithSchema(ScanArraySchema, raw, "scans") as Result<readonly ScanResponse[], ApiError>;
