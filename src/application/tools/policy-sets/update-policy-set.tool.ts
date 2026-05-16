/**
 * Tool: `update_policy_set` — replace name / description / entries.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { PolicySetResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const PolicyEntryShape = z.object({
  tag_slug: z.string().min(1).max(100),
  country_codes: z.array(z.string().length(2)).max(50).default([]),
});

const UpdatePolicySetInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
  name: z.string().min(1).max(200).optional().describe("New name."),
  description: z.string().max(2000).optional().describe("New description."),
  entries: z
    .array(PolicyEntryShape)
    .min(1)
    .max(500)
    .optional()
    .describe("REPLACE the entries list (omit to keep current entries unchanged)."),
} as const;
type UpdatePolicySetInputShape = typeof UpdatePolicySetInputShape;

export type UpdatePolicySetOutput = PolicySetResponse;

export const updatePolicySetTool: Tool<UpdatePolicySetInputShape, UpdatePolicySetOutput> = {
  name: "update_policy_set",
  description:
    "Update a policy set's name, description, or entry list. The entries field, if supplied, REPLACES the whole list (not a merge).",
  annotations: {
    title: "Update Policy Set",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdatePolicySetInputShape),
  handler: async (input, ctx): Promise<Result<UpdatePolicySetOutput, ToolError>> => {
    const body = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.entries !== undefined ? { entries: input.entries } : {}),
    };
    const result = await ctx.api.updatePolicySet(input.policy_set_id, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
