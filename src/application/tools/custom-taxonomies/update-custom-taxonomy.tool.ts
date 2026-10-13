/**
 * Tool: `update_custom_taxonomy` — replace name / description /
 * public-report visibility / tree atomically and bump `version`.
 */

import { z } from "zod";

import type { CustomTaxonomyResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { TaxonomyNodeShape } from "./_taxonomy-nodes-input.js";

const UpdateCustomTaxonomyInputShape = {
  taxonomy_id: z.string().uuid().describe("Custom taxonomy UUID."),
  name: z.string().min(1).max(100).describe("New display name."),
  description: z
    .string()
    .max(500)
    .optional()
    .describe("New description (defaults to empty string)."),
  show_in_public_report: z
    .boolean()
    .optional()
    .describe(
      "Show this taxonomy's tiers on unauthenticated public scan reports. REPLACED like every other field: omitting it sets false and hides the taxonomy from public reports, so pass the current value from `get_custom_taxonomy` to keep it."
    ),
  nodes: z
    .array(TaxonomyNodeShape)
    .max(2000)
    .optional()
    .describe(
      "REPLACEMENT tree as a flat array (REPLACES the existing tree, not a merge). Read the current tree via `get_custom_taxonomy` first if you only want to tweak one node."
    ),
} as const;
type UpdateCustomTaxonomyInputShape = typeof UpdateCustomTaxonomyInputShape;

export type UpdateCustomTaxonomyOutput = CustomTaxonomyResponse;

export const updateCustomTaxonomyTool: Tool<
  UpdateCustomTaxonomyInputShape,
  UpdateCustomTaxonomyOutput
> = {
  name: "update_custom_taxonomy",
  description:
    "REPLACE a custom taxonomy's name, description, public-report visibility, and full tree atomically. The API bumps `version` on every successful update; ongoing scan classifications continue with the previous tree until they finish, so updates are safe but not retroactive.",
  annotations: {
    title: "Update Custom Taxonomy",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateCustomTaxonomyInputShape),
  handler: async (input, ctx): Promise<Result<UpdateCustomTaxonomyOutput, ToolError>> => {
    const result = await ctx.api.updateCustomTaxonomy(input.taxonomy_id, {
      name: input.name,
      description: input.description ?? "",
      show_in_public_report: input.show_in_public_report ?? false,
      nodes: (input.nodes ?? []).map((n) => ({
        client_id: n.client_id,
        parent_client_id: n.parent_client_id ?? null,
        name: n.name,
        description: n.description ?? "",
        is_default: n.is_default ?? false,
      })),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
