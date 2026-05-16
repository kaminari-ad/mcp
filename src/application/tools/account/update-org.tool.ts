/**
 * Tool: `update_org` — rename the caller's organization or patch its
 * settings JSON blob.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { OrgResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateOrgInputShape = {
  name: z.string().min(1).max(200).optional().describe("New organization display name."),
  settings: z
    .record(z.unknown())
    .optional()
    .describe("Replacement settings object. Fields not supplied are left unchanged."),
} as const;
type UpdateOrgInputShape = typeof UpdateOrgInputShape;

export type UpdateOrgOutput = OrgResponse;

export const updateOrgTool: Tool<UpdateOrgInputShape, UpdateOrgOutput> = {
  name: "update_org",
  description:
    "Update the caller's organization — display name and/or settings object. Only supplied fields are touched.",
  annotations: {
    title: "Update Organization",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateOrgInputShape),
  handler: async (input, ctx): Promise<Result<UpdateOrgOutput, ToolError>> => {
    const body = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.settings !== undefined ? { settings: input.settings } : {}),
    };
    const result = await ctx.api.updateOrg(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
