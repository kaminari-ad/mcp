/**
 * Tool: `delete_tag_definition` — delete a CUSTOM tag definition.
 * Past tag assignments stay on historical scans; future scans won't
 * receive the tag.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const DeleteTagDefinitionInputShape = {
  slug: z.string().min(1).max(100).describe("Custom tag slug to delete."),
} as const;
type DeleteTagDefinitionInputShape = typeof DeleteTagDefinitionInputShape;

export interface DeleteTagDefinitionOutput {
  readonly deleted: true;
}

export const deleteTagDefinitionTool: Tool<
  DeleteTagDefinitionInputShape,
  DeleteTagDefinitionOutput
> = {
  name: "delete_tag_definition",
  description:
    "Delete a CUSTOM tag definition. Historical tag assignments are preserved; future scans will not receive this tag. System tags cannot be deleted.",
  annotations: {
    title: "Delete Tag Definition",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(DeleteTagDefinitionInputShape),
  handler: async (input, ctx): Promise<Result<DeleteTagDefinitionOutput, ToolError>> => {
    const result = await ctx.api.deleteTagDefinition(input.slug);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ deleted: true });
  },
};
