/**
 * Tool: `update_policy_set` — replace name / description / entries.
 */

import { z } from "zod";

import type { PolicySetResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { PolicyEntryInput, policyEntryToRequest } from "./_policy-entry-input.js";

const UpdatePolicySetInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
  name: z.string().min(1).max(200).describe("New name (always required by the API on update)."),
  description: z.string().max(2000).describe("New description (empty string allowed)."),
  entries: z
    .array(PolicyEntryInput)
    .min(1)
    .max(500)
    .describe(
      "REPLACEMENT entries list — REPLACES the current list, not a merge. Each entry is a discriminated union over five rule kinds (tag / iab_v3 / brand / ai_category / custom_taxonomy)."
    ),
} as const;
type UpdatePolicySetInputShape = typeof UpdatePolicySetInputShape;

export type UpdatePolicySetOutput = PolicySetResponse;

export const updatePolicySetTool: Tool<UpdatePolicySetInputShape, UpdatePolicySetOutput> = {
  name: "update_policy_set",
  description:
    "REPLACE a policy set's name, description, and entry list. The API requires all three fields on every update — read the current set with `get_policy_set` first if you only want to change one thing. Supports all five rule kinds (tag / iab_v3 / brand / ai_category / custom_taxonomy).",
  annotations: {
    title: "Update Policy Set",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdatePolicySetInputShape),
  handler: async (input, ctx): Promise<Result<UpdatePolicySetOutput, ToolError>> => {
    const result = await ctx.api.updatePolicySet(input.policy_set_id, {
      name: input.name,
      description: input.description,
      entries: input.entries.map(policyEntryToRequest),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
