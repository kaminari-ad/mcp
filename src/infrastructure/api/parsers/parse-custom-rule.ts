/**
 * Parsers for `/api/v1/custom-rules`.
 *
 * `GET /api/v1/custom-rules` returns the standard FastAPI paginated
 * envelope `{ items, total, page, limit, pages }`. `parseCustomRuleArray`
 * accepts both envelope and bare-array shapes defensively.
 */

import type { ApiError, CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseArrayOrItemsWithSchema, parseWithSchema } from "./parse-with-schema.js";

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
  parseWithSchema(CustomRuleSchema, raw, "custom-rule") as Result<CustomRuleResponse, ApiError>;

export const parseCustomRuleArray = (
  raw: unknown
): Result<readonly CustomRuleResponse[], ApiError> =>
  parseArrayOrItemsWithSchema(CustomRuleSchema, raw, "custom-rules") as Result<
    readonly CustomRuleResponse[],
    ApiError
  >;
