/**
 * Per-entity parser for the full `PolicySetResponse` (used by
 * `GET /policy-sets/{id}` and `POST /policy-sets`). Includes
 * `entries` (the tag/country bindings) inline.
 *
 * For the paginated list endpoint see `parse-policy-set-page.ts` —
 * before v0.2.0 a defensive `parsePolicySetList` lived here that
 * silently dropped pagination metadata; that parser is gone and the
 * gateway now surfaces the full `{items, total, page, limit}` envelope
 * to the agent.
 */

import type { ApiError, PolicySetResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const PolicySetSchema = schemas.PolicySetResponse.pick({
  id: true,
  name: true,
  description: true,
  organization_id: true,
  visibility: true,
  is_approved: true,
  is_default: true,
  entries: true,
  created_at: true,
}).strip();

export const parsePolicySet = (raw: unknown): Result<PolicySetResponse, ApiError> =>
  parseWithSchema(PolicySetSchema, raw, "policy-set") as Result<PolicySetResponse, ApiError>;
