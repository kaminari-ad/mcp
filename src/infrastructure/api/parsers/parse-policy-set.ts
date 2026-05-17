/**
 * Parsers for `/api/v1/policy-sets`.
 *
 * `GET /api/v1/policy-sets` returns the FastAPI paginated envelope.
 * `parsePolicySetList` accepts both envelope and bare-array shapes
 * defensively (mirrors `parseCampaignGroupArray`).
 */

import type { ApiError, PolicySetResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseArrayOrItemsWithSchema, parseWithSchema } from "./parse-with-schema.js";

const PolicySetSchema = schemas.PolicySetResponse.pick({
  id: true,
  name: true,
  description: true,
  organization_id: true,
  visibility: true,
  is_approved: true,
  entries: true,
  created_at: true,
}).strip();

export const parsePolicySet = (raw: unknown): Result<PolicySetResponse, ApiError> =>
  parseWithSchema(PolicySetSchema, raw, "policy-set") as Result<PolicySetResponse, ApiError>;

export const parsePolicySetList = (raw: unknown): Result<readonly PolicySetResponse[], ApiError> =>
  parseArrayOrItemsWithSchema(PolicySetSchema, raw, "policy-sets") as Result<
    readonly PolicySetResponse[],
    ApiError
  >;
