/**
 * Tool: `parse_custom_taxonomy_text` — preview-parse free-form text
 * into a tree without persisting anything.
 *
 * Lets the agent / user paste indented text (or any structured outline)
 * and get back a flat array of nodes with implied levels + warnings
 * for any rows the parser had to repair. The agent can review the
 * preview, set is_default, and call `create_custom_taxonomy` to persist.
 */

import { z } from "zod";

import type { ParseTaxonomyTextResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ParseCustomTaxonomyTextInputShape = {
  text: z
    .string()
    .min(1)
    .max(50000)
    .describe(
      "Free-form text describing the tree (one node per line; indentation expresses depth). Up to 50 000 chars."
    ),
} as const;
type ParseCustomTaxonomyTextInputShape = typeof ParseCustomTaxonomyTextInputShape;

export type ParseCustomTaxonomyTextOutput = ParseTaxonomyTextResponse;

export const parseCustomTaxonomyTextTool: Tool<
  ParseCustomTaxonomyTextInputShape,
  ParseCustomTaxonomyTextOutput
> = {
  name: "parse_custom_taxonomy_text",
  description:
    "Preview-parse pasted free-form text into a taxonomy tree (NOT persisted). Returns `nodes: [{level, name, description}]` + `warnings: string[]`. After review, persist via `create_custom_taxonomy` (remember to flag exactly one node as is_default).",
  annotations: {
    title: "Parse Custom Taxonomy Text",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ParseCustomTaxonomyTextInputShape),
  handler: async (input, ctx): Promise<Result<ParseCustomTaxonomyTextOutput, ToolError>> => {
    const result = await ctx.api.parseCustomTaxonomyText({ text: input.text });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
