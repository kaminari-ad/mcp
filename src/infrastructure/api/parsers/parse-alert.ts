/**
 * Parsers for `/api/v1/alerts` — single + paginated page envelope.
 */

import type {
  AlertResponse,
  ApiError,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parsePagedWithItemSchema, parseWithSchema } from "./parse-with-schema.js";

const AlertSchema = schemas.AlertResponse.pick({
  id: true,
  scan_id: true,
  campaign_id: true,
  policy_set_id: true,
  violation_rule_id: true,
  tag_slug: true,
  tag_display_name: true,
  country_code: true,
  status: true,
  closed_by: true,
  scan_url: true,
  offer_url: true,
  created_at: true,
  updated_at: true,
}).strip();

export const parseAlert = (raw: unknown): Result<AlertResponse, ApiError> =>
  parseWithSchema(AlertSchema, raw, "alert") as Result<AlertResponse, ApiError>;

export const parseAlertPage = (raw: unknown): Result<PaginatedResponse<AlertResponse>, ApiError> =>
  parsePagedWithItemSchema(AlertSchema, raw, "alerts") as Result<
    PaginatedResponse<AlertResponse>,
    ApiError
  >;
