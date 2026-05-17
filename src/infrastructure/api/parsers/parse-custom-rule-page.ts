/**
 * Parser for `GET /api/v1/custom-rules` — paginated custom-rule
 * envelope.
 *
 * The endpoint returns the standard FastAPI paginated envelope
 * `{ items, total, page, limit, pages }`. Before v0.2.0 the gateway
 * used `parseCustomRuleArray` (defensive bare-or-envelope) which
 * silently dropped the pagination metadata — agents under-paginated
 * on orgs with >50 rules. This parser exposes the full envelope so
 * the `list_custom_rules` tool can surface `total` / `page` / `limit`
 * to the agent.
 */

import type {
  ApiError,
  CustomRuleResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parsePagedWithItemSchema } from "./parse-with-schema.js";

const CustomRuleSchema = schemas.CustomRuleResponse.pick({
  id: true,
  organization_id: true,
  name: true,
  tag_slug: true,
  rule_type: true,
  config: true,
  target: true,
  is_active: true,
  created_at: true,
}).strip();

export const parseCustomRulePage = (
  raw: unknown
): Result<PaginatedResponse<CustomRuleResponse>, ApiError> =>
  parsePagedWithItemSchema(CustomRuleSchema, raw, "custom-rules") as Result<
    PaginatedResponse<CustomRuleResponse>,
    ApiError
  >;
