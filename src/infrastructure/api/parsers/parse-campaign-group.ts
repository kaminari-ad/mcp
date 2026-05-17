/**
 * Parsers for the `/api/v1/campaign-groups` family.
 *
 * `GET /api/v1/campaign-groups` returns a BARE ARRAY per OpenAPI (no
 * paginated envelope). `parseCampaignGroupArray` accepts both shapes
 * defensively — same `unwrapItems` pattern used in `parsePolicySetList`
 * — so a future API release that wraps the response in an envelope
 * does not break the MCP gateway.
 */

import type { ApiError, CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseArrayOrItemsWithSchema, parseWithSchema } from "./parse-with-schema.js";

const CampaignGroupSchema = schemas.CampaignGroupResponse.pick({
  id: true,
  name: true,
  is_default: true,
  is_archived: true,
  schedule_paused: true,
  campaign_count: true,
  created_at: true,
}).strip();

export const parseCampaignGroup = (raw: unknown): Result<CampaignGroupResponse, ApiError> =>
  parseWithSchema(CampaignGroupSchema, raw, "campaign-group") as Result<
    CampaignGroupResponse,
    ApiError
  >;

export const parseCampaignGroupArray = (
  raw: unknown
): Result<readonly CampaignGroupResponse[], ApiError> =>
  parseArrayOrItemsWithSchema(CampaignGroupSchema, raw, "campaign-groups") as Result<
    readonly CampaignGroupResponse[],
    ApiError
  >;
