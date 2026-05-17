/**
 * Parsers for `/api/v1/tag-definitions`.
 */

import { z } from "zod";

import type { ApiError, TagDefinitionResponse } from "../../../domain/ports/api-gateway.js";
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
  show_in_public_report: true,
  scans_count: true,
  rules_count: true,
}).strip();

const TagDefinitionArraySchema = z.array(TagDefinitionSchema);

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
