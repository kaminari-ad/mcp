/**
 * Tool: `list_tags` — paginated tag definitions (system + custom) with
 * usage stats (scans count, rules count).
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type {
  PaginatedResponse,
  TagDefinitionResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListTagsInputShape = {
  category: z
    .string()
    .optional()
    .describe("Optional category slug to filter by (e.g. malware, redirect, branding)."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size (1-200)."),
} as const;
type ListTagsInputShape = typeof ListTagsInputShape;

export type ListTagsOutput = PaginatedResponse<TagDefinitionResponse>;

export const listTagsTool: Tool<ListTagsInputShape, ListTagsOutput> = {
  name: "list_tags",
  description:
        "List every tag definition the platform knows (system tags + organization custom tags) with category, severity, and usage counters.",
      annotations: { title: "List Tags", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(ListTagsInputShape),
  handler: async (input, ctx): Promise<Result<ListTagsOutput, ToolError>> => {
    const filters = {
      page: input.page,
      limit: input.limit,
      ...(input.category !== undefined ? { category: input.category } : {}),
    };
    const result = await ctx.api.listTags(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
