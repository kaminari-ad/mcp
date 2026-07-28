/**
 * Parsers for `/api/v1/custom-taxonomies/*`.
 *
 * Slim list-row schema for the index endpoint, a richer detail schema
 * for the single-entity endpoints (with the full `nodes` array), and
 * a dedicated parser for the text-preview endpoint that returns a
 * mix of parsed nodes + warnings.
 */

import { z } from "zod";

import type {
  ApiError,
  CustomTaxonomyListItem,
  CustomTaxonomyResponse,
  ParseTaxonomyTextResponse,
} from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const CustomTaxonomyListItemSchema = schemas.CustomTaxonomyListItem.pick({
  id: true,
  name: true,
  slug: true,
  description: true,
  is_active: true,
  version: true,
  node_count: true,
  created_at: true,
  updated_at: true,
}).strip();

const CustomTaxonomyListSchema = z.array(CustomTaxonomyListItemSchema);

const TaxonomyNodeSchema = schemas.TaxonomyNodeResponse.pick({
  id: true,
  parent_id: true,
  level: true,
  position: true,
  name: true,
  description: true,
  is_default: true,
}).strip();

const CustomTaxonomySchema = schemas.CustomTaxonomyResponse.pick({
  id: true,
  organization_id: true,
  name: true,
  slug: true,
  description: true,
  is_active: true,
  version: true,
  created_at: true,
  updated_at: true,
})
  .extend({ nodes: z.array(TaxonomyNodeSchema) })
  .strip();

const ParsedTaxonomyNodeSchema = schemas.ParsedTaxonomyNode.pick({
  level: true,
  name: true,
  description: true,
}).strip();

const ParseTaxonomyTextResponseSchema = schemas.ParseTaxonomyTextResponse.pick({
  warnings: true,
})
  .extend({ nodes: z.array(ParsedTaxonomyNodeSchema) })
  .strip();

export const parseCustomTaxonomyList = (
  raw: unknown
): Result<readonly CustomTaxonomyListItem[], ApiError> =>
  parseWithSchema(CustomTaxonomyListSchema, raw, "custom-taxonomies");

export const parseCustomTaxonomy = (raw: unknown): Result<CustomTaxonomyResponse, ApiError> =>
  parseWithSchema(CustomTaxonomySchema, raw, "custom-taxonomy");

export const parseTaxonomyTextPreview = (
  raw: unknown
): Result<ParseTaxonomyTextResponse, ApiError> =>
  parseWithSchema(ParseTaxonomyTextResponseSchema, raw, "custom-taxonomy-parse-text");
