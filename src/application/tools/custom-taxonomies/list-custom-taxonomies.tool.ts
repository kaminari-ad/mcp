/**
 * Tool: `list_custom_taxonomies` — slim list of the org's custom
 * classification taxonomies (one per row, no node trees).
 *
 * Custom taxonomies let an org define its own classification tree
 * for scans alongside the canonical IAB V3 taxonomy. The LLM picks
 * one node (or the org's chosen default) per scan, and policy sets
 * can alert on those nodes via the `custom_taxonomy` rule kind.
 */

import { z } from "zod";

import type { CustomTaxonomyListItem } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCustomTaxonomiesInputShape = {} as const;
type ListCustomTaxonomiesInputShape = typeof ListCustomTaxonomiesInputShape;

export interface ListCustomTaxonomiesOutput {
  readonly items: readonly CustomTaxonomyListItem[];
}

export const listCustomTaxonomiesTool: Tool<
  ListCustomTaxonomiesInputShape,
  ListCustomTaxonomiesOutput
> = {
  name: "list_custom_taxonomies",
  description:
    "List the calling org's custom classification taxonomies. Returns slim summaries (id, name, slug, version, node_count, is_active). Soft-deleted taxonomies are included with `is_active=false`. Fetch the full tree via `get_custom_taxonomy`.",
  annotations: {
    title: "List Custom Taxonomies",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListCustomTaxonomiesInputShape),
  handler: async (_input, ctx): Promise<Result<ListCustomTaxonomiesOutput, ToolError>> => {
    const result = await ctx.api.listCustomTaxonomies();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value });
  },
};
