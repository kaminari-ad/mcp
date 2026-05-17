/**
 * Parsers for `/api/v1/policy-sets`.
 *
 * The API exposes TWO shapes for policy sets:
 *
 *   - `PolicySetResponse` — full entity, used by `GET /policy-sets/{id}`
 *     and `POST /policy-sets`. Includes `entries` (the tag/country
 *     bindings) inline.
 *   - `PolicySetListItem` — slim per-item shape returned inside the
 *     paginated envelope from `GET /policy-sets`. **Omits `entries`**;
 *     callers that need them must follow up with `getPolicySet(id)`.
 *
 * `parsePolicySetList` MUST use the slim schema — using the full
 * schema would fail zod parse on every real list call because
 * `entries` is required there but absent in the list payload. The
 * list parser still accepts both bare-array and `{items: [...]}`
 * envelope shapes defensively (same `parseArrayOrItemsWithSchema`
 * pattern used in `parseCustomRuleArray` / `parseCampaignGroupArray`).
 */

import type {
  ApiError,
  PolicySetListItemResponse,
  PolicySetResponse,
} from "../../../domain/ports/api-gateway.js";
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

const PolicySetListItemSchema = schemas.PolicySetListItem.pick({
  id: true,
  name: true,
  description: true,
  organization_id: true,
  visibility: true,
  is_approved: true,
  created_at: true,
}).strip();

export const parsePolicySet = (raw: unknown): Result<PolicySetResponse, ApiError> =>
  parseWithSchema(PolicySetSchema, raw, "policy-set") as Result<PolicySetResponse, ApiError>;

export const parsePolicySetList = (
  raw: unknown
): Result<readonly PolicySetListItemResponse[], ApiError> =>
  parseArrayOrItemsWithSchema(PolicySetListItemSchema, raw, "policy-sets") as Result<
    readonly PolicySetListItemResponse[],
    ApiError
  >;
