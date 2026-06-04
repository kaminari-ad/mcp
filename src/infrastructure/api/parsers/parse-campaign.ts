/**
 * Parsers for `/api/v1/campaigns` — single + paginated page envelope.
 */

import type {
  ApiError,
  CampaignResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parsePagedWithItemSchema, parseWithSchema } from "./parse-with-schema.js";

const CampaignSchema = schemas.CampaignResponse.pick({
  id: true,
  name: true,
  campaign_type: true,
  url: true,
  ad_tag: true,
  country_codes: true,
  group_id: true,
  emulator_selection: true,
  proxy_type: true,
  proxy_region: true,
  proxy_city: true,
  proxy_isp: true,
  labels: true,
  policy_set_id: true,
  schedule_enabled: true,
  schedule_type: true,
  schedule_weekly: true,
  schedule_interval_seconds: true,
  schedule_timezone: true,
  is_archived: true,
  created_at: true,
  last_run_at: true,
}).strip();

export const parseCampaign = (raw: unknown): Result<CampaignResponse, ApiError> =>
  parseWithSchema(CampaignSchema, raw, "campaign") as Result<CampaignResponse, ApiError>;

export const parseCampaignPage = (
  raw: unknown
): Result<PaginatedResponse<CampaignResponse>, ApiError> =>
  parsePagedWithItemSchema(CampaignSchema, raw, "campaigns") as Result<
    PaginatedResponse<CampaignResponse>,
    ApiError
  >;
