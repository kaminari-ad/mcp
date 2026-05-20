/**
 * Tool: `create_policy_set` — define a new violation policy.
 */

import { z } from "zod";

import type { PolicySetResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { PolicyEntryInput, policyEntryToRequest } from "./_policy-entry-input.js";

const CreatePolicySetInputShape = {
  name: z.string().min(1).max(200).describe("Display name."),
  description: z.string().max(2000).describe("Free-form description (use empty string for none)."),
  entries: z
    .array(PolicyEntryInput)
    .min(1)
    .max(500)
    .describe(
      "At least one entry. Each entry is a discriminated union over five rule kinds: tag / iab_v3 / brand / ai_category / custom_taxonomy."
    ),
} as const;
type CreatePolicySetInputShape = typeof CreatePolicySetInputShape;

export type CreatePolicySetOutput = PolicySetResponse;

export const createPolicySetTool: Tool<CreatePolicySetInputShape, CreatePolicySetOutput> = {
  name: "create_policy_set",
  description:
    "Create a new policy set (named collection of violation rules). Each rule is one of: tag slug, IAB V3 category prefix, advertiser brand, freeform AI category, or per-org custom-taxonomy node. Bind campaigns to the set via `update_campaign`.",
  annotations: {
    title: "Create Policy Set",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreatePolicySetInputShape),
  handler: async (input, ctx): Promise<Result<CreatePolicySetOutput, ToolError>> => {
    const result = await ctx.api.createPolicySet({
      name: input.name,
      description: input.description,
      entries: input.entries.map(policyEntryToRequest),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
