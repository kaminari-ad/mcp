/**
 * Tool: `restore_custom_taxonomy` — re-activate a soft-deleted taxonomy.
 */

import { z } from "zod";

import type { CustomTaxonomyResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const RestoreCustomTaxonomyInputShape = {
  taxonomy_id: z
    .string()
    .uuid()
    .describe("Custom taxonomy UUID (must currently be is_active=false)."),
} as const;
type RestoreCustomTaxonomyInputShape = typeof RestoreCustomTaxonomyInputShape;

export type RestoreCustomTaxonomyOutput = CustomTaxonomyResponse;

export const restoreCustomTaxonomyTool: Tool<
  RestoreCustomTaxonomyInputShape,
  RestoreCustomTaxonomyOutput
> = {
  name: "restore_custom_taxonomy",
  description:
    "Re-activate a previously soft-deleted custom taxonomy. Returns the restored taxonomy with its full tree (is_active=true).",
  annotations: {
    title: "Restore Custom Taxonomy",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(RestoreCustomTaxonomyInputShape),
  handler: async (input, ctx): Promise<Result<RestoreCustomTaxonomyOutput, ToolError>> => {
    const result = await ctx.api.restoreCustomTaxonomy(input.taxonomy_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
