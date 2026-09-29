/**
 * Parsers for `/api/v1/campaigns` — single + paginated page envelope.
 */

import { z } from "zod";

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
  vast_tag: true,
  referrer: true,
  country_codes: true,
  group_id: true,
  emulator_selection: true,
  proxy_type: true,
  proxy_region: true,
  proxy_city: true,
  proxy_isp: true,
  repeat_count: true,
  repeat_mode: true,
  retry_max_attempts: true,
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
})
  // openapi-zod-client does not carry a `default` onto a $ref'd enum, so
  // the generated `repeat_mode` is a bare `.optional()` while the API
  // always sends it. Restore the API's default rather than loosening the
  // port, which would push a phantom `undefined` onto every consumer.
  .extend({ repeat_mode: schemas.RepeatMode.default("isolated") })
  // Extended rather than picked for the same reason, one release earlier in
  // the cycle: the generated schema is regenerated off the DEPLOYED
  // openapi.json and this field ships with this release (see
  // `MaxDiscoveredAdsResponse` in the port). Nullable: every campaign saved
  // before the field carries null.
  .extend({ max_discovered_ads: z.number().int().nullable().optional() })
  // Same escape hatch; strings, not the enum (see `AdFormat` in the port).
  .extend({ ad_formats: z.array(z.string()).nullable().optional() })
  // Extended for the same reason, and optional rather than defaulted to 0: an
  // api that predates the field sends nothing, and inventing a 0 would tell an
  // agent the campaign skips nothing when the truth is that it cannot say.
  .extend({ ignore_first_n_domains: z.number().int().optional() })
  .strip();

export const parseCampaign = (raw: unknown): Result<CampaignResponse, ApiError> =>
  parseWithSchema(CampaignSchema, raw, "campaign") as Result<CampaignResponse, ApiError>;

export const parseCampaignPage = (
  raw: unknown
): Result<PaginatedResponse<CampaignResponse>, ApiError> =>
  parsePagedWithItemSchema(CampaignSchema, raw, "campaigns") as Result<
    PaginatedResponse<CampaignResponse>,
    ApiError
  >;
