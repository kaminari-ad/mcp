/**
 * Parser for `GET /api/v1/policy-sets/{id}/campaigns` — the paginated
 * list of campaigns bound to one policy set.
 */

import type {
  ApiError,
  LinkedCampaignResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parsePagedWithItemSchema } from "./parse-with-schema.js";

const LinkedCampaignSchema = schemas.LinkedCampaignResponse.pick({
  id: true,
  name: true,
  is_archived: true,
}).strip();

export const parseLinkedCampaignPage = (
  raw: unknown
): Result<PaginatedResponse<LinkedCampaignResponse>, ApiError> =>
  parsePagedWithItemSchema(LinkedCampaignSchema, raw, "policy-set-campaigns");
