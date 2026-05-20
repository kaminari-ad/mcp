/**
 * Tool: `delete_custom_taxonomy` — soft-delete a taxonomy.
 *
 * Sets `is_active=false`. Historical scan classifications keep
 * referencing the taxonomy id (the rows are not removed). Reverse
 * via `restore_custom_taxonomy`.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const DeleteCustomTaxonomyInputShape = {
  taxonomy_id: z.string().uuid().describe("Custom taxonomy UUID."),
} as const;
type DeleteCustomTaxonomyInputShape = typeof DeleteCustomTaxonomyInputShape;

export interface DeleteCustomTaxonomyOutput {
  readonly deleted: true;
}

export const deleteCustomTaxonomyTool: Tool<
  DeleteCustomTaxonomyInputShape,
  DeleteCustomTaxonomyOutput
> = {
  name: "delete_custom_taxonomy",
  description:
    "Soft-delete a custom taxonomy (sets is_active=false). Historical scan classifications keep referencing the id; new scans skip this taxonomy. Use `restore_custom_taxonomy` to undo.",
  annotations: {
    title: "Delete Custom Taxonomy",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(DeleteCustomTaxonomyInputShape),
  handler: async (input, ctx): Promise<Result<DeleteCustomTaxonomyOutput, ToolError>> => {
    const result = await ctx.api.deleteCustomTaxonomy(input.taxonomy_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ deleted: true });
  },
};
