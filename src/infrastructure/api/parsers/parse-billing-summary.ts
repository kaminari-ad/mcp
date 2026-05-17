/**
 * Parser for `GET /api/v1/billing` — billing summary.
 */

import type { ApiError, BillingSummaryResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const BillingSummarySchema = schemas.BillingSummaryResponse.pick({
  balance_micros: true,
  plan_id: true,
  plan_name: true,
  checks_per_period: true,
  checks_used: true,
  period_start: true,
  period_end: true,
  price_per_extra_check_micros: true,
  is_suspended: true,
  can_create_scan: true,
  billing_mode: true,
  block_reason: true,
}).strip();

export const parseBillingSummary = (raw: unknown): Result<BillingSummaryResponse, ApiError> =>
  parseWithSchema(BillingSummarySchema, raw, "billing-summary") as Result<
    BillingSummaryResponse,
    ApiError
  >;
