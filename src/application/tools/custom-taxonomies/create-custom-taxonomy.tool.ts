/**
 * Tool: `create_custom_taxonomy` — create a taxonomy with its tree.
 */

import { z } from "zod";

import type { CustomTaxonomyResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { TaxonomyNodeShape } from "./_taxonomy-nodes-input.js";

const CreateCustomTaxonomyInputShape = {
  name: z.string().min(1).max(100).describe("Display name (1-100 chars)."),
  description: z
    .string()
    .max(500)
    .optional()
    .describe("Free-form description (defaults to empty string)."),
  nodes: z
    .array(TaxonomyNodeShape)
    .max(2000)
    .optional()
    .describe(
      "Initial tree as a flat array (parents before children, linked via client_id / parent_client_id). Empty / omitted = empty taxonomy."
    ),
} as const;
type CreateCustomTaxonomyInputShape = typeof CreateCustomTaxonomyInputShape;

export type CreateCustomTaxonomyOutput = CustomTaxonomyResponse;

export const createCustomTaxonomyTool: Tool<
  CreateCustomTaxonomyInputShape,
  CreateCustomTaxonomyOutput
> = {
  name: "create_custom_taxonomy",
  description:
    "Create a custom classification taxonomy with its initial tree. Exactly one node should have is_default=true (fallback for scans the LLM cannot classify confidently). Returns the persisted taxonomy with allocated node UUIDs and version=1.",
  annotations: {
    title: "Create Custom Taxonomy",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreateCustomTaxonomyInputShape),
  handler: async (input, ctx): Promise<Result<CreateCustomTaxonomyOutput, ToolError>> => {
    const result = await ctx.api.createCustomTaxonomy({
      name: input.name,
      description: input.description ?? "",
      nodes: (input.nodes ?? []).map(toRequestNode),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};

function toRequestNode(n: {
  client_id: string;
  parent_client_id?: string | null | undefined;
  name: string;
  description?: string | undefined;
  is_default?: boolean | undefined;
}): {
  client_id: string;
  parent_client_id: string | null;
  name: string;
  description: string;
  is_default: boolean;
} {
  return {
    client_id: n.client_id,
    parent_client_id: n.parent_client_id ?? null,
    name: n.name,
    description: n.description ?? "",
    is_default: n.is_default ?? false,
  };
}
