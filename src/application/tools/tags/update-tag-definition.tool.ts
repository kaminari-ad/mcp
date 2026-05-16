/**
 * Tool: `update_tag_definition` — patch a tag's display fields. Only
 * custom (organization-owned) tags are editable.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { TagDefinitionWithDetailResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateTagDefinitionInputShape = {
  slug: z.string().min(1).max(100).describe("Tag slug."),
  display_name: z.string().min(1).max(200).optional().describe("New human-readable name."),
  description: z.string().max(2000).optional().describe("New description."),
  severity: z
    .enum(["info", "low", "medium", "high", "critical"])
    .optional()
    .describe("New severity level."),
  show_in_public_report: z
    .boolean()
    .optional()
    .describe("Whether the tag appears in the public scan-report view."),
} as const;
type UpdateTagDefinitionInputShape = typeof UpdateTagDefinitionInputShape;

export type UpdateTagDefinitionOutput = TagDefinitionWithDetailResponse;

export const updateTagDefinitionTool: Tool<
  UpdateTagDefinitionInputShape,
  UpdateTagDefinitionOutput
> = {
  name: "update_tag_definition",
  description:
    "Update display fields of a CUSTOM tag (system tags are read-only). Only supplied fields are touched.",
  annotations: {
    title: "Update Tag Definition",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateTagDefinitionInputShape),
  handler: async (input, ctx): Promise<Result<UpdateTagDefinitionOutput, ToolError>> => {
    const body = {
      ...(input.display_name !== undefined ? { display_name: input.display_name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.severity !== undefined ? { severity: input.severity } : {}),
      ...(input.show_in_public_report !== undefined
        ? { show_in_public_report: input.show_in_public_report }
        : {}),
    };
    const result = await ctx.api.updateTagDefinition(input.slug, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
