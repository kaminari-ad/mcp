/**
 * Tool: `list_tags` — every tag definition (system + custom) with
 * usage stats.
 *
 * API endpoint: `GET /api/v1/tag-definitions` returns a flat array
 * (no pagination), so this tool surfaces all tags at once.
 */

import { z } from "zod";

import type { TagDefinitionResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListTagsInputShape = {
  category: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe(
      "Filter to tags in one category slug (e.g. 'security', 'malware', 'compliance'). Use the slug exactly as it appears in `category` of an existing tag."
    ),
  include_archived: z
    .boolean()
    .optional()
    .describe(
      "Also return the archived tag definitions this organization owns, which are excluded by default. An archived tag is retired: it is no longer assigned to scans and no longer raises alerts, and archived platform (system) tags are never returned at all — so this flag cannot resolve a slug seen on an older scan."
    ),
} as const;
type ListTagsInputShape = typeof ListTagsInputShape;

export interface ListTagsOutput {
  readonly items: readonly TagDefinitionResponse[];
  readonly total: number;
}

export const listTagsTool: Tool<ListTagsInputShape, ListTagsOutput> = {
  name: "list_tags",
  description:
    "List every tag definition in service for this organization (system tags + organization custom tags) with category, severity, visibility, and usage counters (scans + rules per tag). Optionally filter by category, and pass `include_archived` to also see the retired definitions this organization owns.",
  annotations: {
    title: "List Tags",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListTagsInputShape),
  handler: async (input, ctx): Promise<Result<ListTagsOutput, ToolError>> => {
    const filters = {
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.include_archived !== undefined ? { include_archived: input.include_archived } : {}),
    };
    const result = await ctx.api.listTags(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
