/**
 * Parser for `GET /api/v1/policy-sets` — paginated policy-set list
 * envelope.
 *
 * Items use the slim `PolicySetListItem` schema (no `entries` — the
 * tag/country bindings are fetched on demand via `getPolicySet(id)`).
 * Before v0.2.0 the gateway used `parsePolicySetList` (defensive
 * bare-or-envelope) which silently dropped the pagination metadata.
 * This parser surfaces the full envelope so the `list_policy_sets`
 * tool can expose `total` / `page` / `limit` to the agent.
 */

import type {
  ApiError,
  PaginatedResponse,
  PolicySetListItemResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parsePagedWithItemSchema } from "./parse-with-schema.js";

const PolicySetListItemSchema = schemas.PolicySetListItem.pick({
  id: true,
  name: true,
  description: true,
  organization_id: true,
  visibility: true,
  is_approved: true,
  created_at: true,
}).strip();

export const parsePolicySetPage = (
  raw: unknown
): Result<PaginatedResponse<PolicySetListItemResponse>, ApiError> =>
  parsePagedWithItemSchema(PolicySetListItemSchema, raw, "policy-sets") as Result<
    PaginatedResponse<PolicySetListItemResponse>,
    ApiError
  >;
