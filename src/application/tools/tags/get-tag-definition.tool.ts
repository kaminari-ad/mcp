/**
 * Tool: `get_tag_definition` — full detail for one tag (system or custom).
 */

import { z } from "zod";

import type { TagDefinitionDetailResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetTagDefinitionInputShape = {
  slug: z
    .string()
    .min(1)
    .max(100)
    .describe("Tag slug (e.g. `malware`, `redirect_chain_too_long`)."),
} as const;
type GetTagDefinitionInputShape = typeof GetTagDefinitionInputShape;

export type GetTagDefinitionOutput = TagDefinitionDetailResponse;

export const getTagDefinitionTool: Tool<GetTagDefinitionInputShape, GetTagDefinitionOutput> = {
  name: "get_tag_definition",
  description:
    "Get full definition of one tag: display name, description, severity, category, source (system vs custom), public-report visibility, usage counts, plus `linked_rules` — the custom rules currently producing this tag (id, name, active flag). Fetch a specific rule's full config via `get_custom_rule`.",
  annotations: {
    title: "Get Tag Definition",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetTagDefinitionInputShape),
  handler: async (input, ctx): Promise<Result<GetTagDefinitionOutput, ToolError>> => {
    const result = await ctx.api.getTagDefinition(input.slug);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
