/**
 * Per-entity parser for a single `CustomRuleResponse` (used by
 * `GET /api/v1/custom-rules/{rule_id}` and `POST /custom-rules`).
 *
 * For the paginated list endpoint see `parse-custom-rule-page.ts` —
 * before v0.2.0 a defensive `parseCustomRuleArray` lived here that
 * silently dropped pagination metadata; that parser is gone and the
 * gateway now surfaces the full envelope to the agent.
 */

import type { ApiError, CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

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

export const parseCustomRule = (raw: unknown): Result<CustomRuleResponse, ApiError> =>
  parseWithSchema(CustomRuleSchema, raw, "custom-rule");
