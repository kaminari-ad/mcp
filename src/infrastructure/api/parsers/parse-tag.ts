/**
 * Parsers for `/api/v1/tag-definitions`.
 *
 * Two endpoints, two schemas:
 *
 *   - `GET /tag-definitions` (list) returns `TagDefinitionWithStatsResponse[]`
 *     — per-row shape with `scans_count` / `rules_count` but no
 *     `linked_rules`. Use `parseTagDefinitionArray` /
 *     `parseTag` (single item).
 *   - `GET /tag-definitions/{slug}` (detail) returns
 *     `TagDefinitionDetailResponse` — extends the per-row shape with
 *     a `linked_rules: LinkedRuleResponse[]` array of the custom
 *     rules that produce this tag. Use `parseTagDetail`.
 *
 * Before v0.2.0 `parseTagDetail` reused the list schema and silently
 * dropped `linked_rules`. Now both parsers live here side-by-side.
 */

import { z } from "zod";

import type {
  ApiError,
  TagDefinitionDetailResponse,
  TagDefinitionResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const TagDefinitionSchema = schemas.TagDefinitionWithStatsResponse.pick({
  slug: true,
  category: true,
  source: true,
  display_name: true,
  description: true,
  severity: true,
  is_system: true,
  organization_id: true,
  visibility: true,
  scans_count: true,
  rules_count: true,
}).strip();

const TagDefinitionArraySchema = z.array(TagDefinitionSchema);

// The OpenAPI `TagDefinitionDetailResponse` has the same per-row
// shape PLUS an optional `linked_rules: LinkedRuleResponse[]`. The
// inner schema is narrowed to the agent-facing `LinkedRule` projection
// (id + name + is_active — see port type rationale).
const LinkedRuleSchema = schemas.LinkedRuleResponse.pick({
  id: true,
  name: true,
  is_active: true,
}).strip();

const TagDetailSchema = schemas.TagDefinitionDetailResponse.pick({
  slug: true,
  category: true,
  source: true,
  display_name: true,
  description: true,
  severity: true,
  is_system: true,
  organization_id: true,
  visibility: true,
  scans_count: true,
  rules_count: true,
})
  .extend({ linked_rules: z.array(LinkedRuleSchema).optional() })
  .strip();

export const parseTag = (raw: unknown): Result<TagDefinitionResponse, ApiError> =>
  parseWithSchema(TagDefinitionSchema, raw, "tag-definition") as Result<
    TagDefinitionResponse,
    ApiError
  >;

export const parseTagDefinitionArray = (
  raw: unknown
): Result<readonly TagDefinitionResponse[], ApiError> =>
  parseWithSchema(TagDefinitionArraySchema, raw, "tag-definitions") as Result<
    readonly TagDefinitionResponse[],
    ApiError
  >;

export const parseTagDetail = (raw: unknown): Result<TagDefinitionDetailResponse, ApiError> =>
  parseWithSchema(TagDetailSchema, raw, "tag-definition") as Result<
    TagDefinitionDetailResponse,
    ApiError
  >;
