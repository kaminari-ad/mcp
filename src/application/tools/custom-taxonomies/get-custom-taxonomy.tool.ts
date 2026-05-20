/**
 * Tool: `get_custom_taxonomy` — one taxonomy with its full node tree.
 */

import { z } from "zod";

import type { CustomTaxonomyResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetCustomTaxonomyInputShape = {
  taxonomy_id: z.string().uuid().describe("Custom taxonomy UUID."),
} as const;
type GetCustomTaxonomyInputShape = typeof GetCustomTaxonomyInputShape;

export type GetCustomTaxonomyOutput = CustomTaxonomyResponse;

export const getCustomTaxonomyTool: Tool<GetCustomTaxonomyInputShape, GetCustomTaxonomyOutput> = {
  name: "get_custom_taxonomy",
  description:
    "Get one custom taxonomy by UUID with its full node tree (each node has id, parent_id, level, position, name, description, is_default).",
  annotations: {
    title: "Get Custom Taxonomy",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetCustomTaxonomyInputShape),
  handler: async (input, ctx): Promise<Result<GetCustomTaxonomyOutput, ToolError>> => {
    const result = await ctx.api.getCustomTaxonomy(input.taxonomy_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
