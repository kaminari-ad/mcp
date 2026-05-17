/**
 * Tool: `update_tag_definition` — patch a tag's display fields. Only
 * custom (organization-owned) tags are editable.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateTagDefinitionInputShape = {
  slug: z.string().min(1).max(100).describe("Tag slug."),
  display_name: z.string().min(1).max(200).optional().describe("New human-readable name."),
  description: z.string().max(2000).optional().describe("New description."),
  severity: z.enum(["high", "medium", "low"]).optional().describe("New severity level."),
  show_in_public_report: z
    .boolean()
    .optional()
    .describe("Whether the tag appears in the public scan-report view."),
} as const;
type UpdateTagDefinitionInputShape = typeof UpdateTagDefinitionInputShape;

export interface UpdateTagDefinitionOutput {
  readonly updated: true;
}

export const updateTagDefinitionTool: Tool<
  UpdateTagDefinitionInputShape,
  UpdateTagDefinitionOutput
> = {
  name: "update_tag_definition",
  description:
    "Update display fields of a CUSTOM tag (system tags are read-only). Only supplied fields are touched. To read the updated definition, follow up with `get_tag_definition`.",
  annotations: {
    title: "Update Tag Definition",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateTagDefinitionInputShape),
  handler: async (input, ctx): Promise<Result<UpdateTagDefinitionOutput, ToolError>> => {
    const body: {
      display_name?: string;
      description?: string;
      severity?: "high" | "medium" | "low";
      show_in_public_report?: boolean;
    } = {};
    if (input.display_name !== undefined) body.display_name = input.display_name;
    if (input.description !== undefined) body.description = input.description;
    if (input.severity !== undefined) body.severity = input.severity;
    if (input.show_in_public_report !== undefined) {
      body.show_in_public_report = input.show_in_public_report;
    }
    // API returns 204 No Content on success.
    const result = await ctx.api.updateTagDefinition(input.slug, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ updated: true });
  },
};
