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

const ListTagsInputShape = {} as const;
type ListTagsInputShape = typeof ListTagsInputShape;

export interface ListTagsOutput {
  readonly items: readonly TagDefinitionResponse[];
  readonly total: number;
}

export const listTagsTool: Tool<ListTagsInputShape, ListTagsOutput> = {
  name: "list_tags",
  description:
    "List every tag definition the platform knows (system tags + organization custom tags) with category, severity, and usage counters (scans + rules per tag).",
  annotations: {
    title: "List Tags",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListTagsInputShape),
  handler: async (_input, ctx): Promise<Result<ListTagsOutput, ToolError>> => {
    const result = await ctx.api.listTags();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
