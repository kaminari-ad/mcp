/**
 * Tool: `create_policy_set` — define a new violation policy.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { PolicySetResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const PolicyEntryShape = z.object({
  tag_slug: z.string().min(1).max(100).describe("Tag slug that triggers a violation."),
  country_codes: z
    .array(z.string().length(2))
    .max(50)
    .default([])
    .describe("Restrict the violation to these countries. Empty = all countries."),
});

const CreatePolicySetInputShape = {
  name: z.string().min(1).max(200).describe("Display name."),
  description: z.string().max(2000).optional().describe("Free-form description."),
  entries: z
    .array(PolicyEntryShape)
    .min(1)
    .max(500)
    .describe("At least one entry. Each entry pairs a tag-slug with country codes."),
} as const;
type CreatePolicySetInputShape = typeof CreatePolicySetInputShape;

export type CreatePolicySetOutput = PolicySetResponse;

export const createPolicySetTool: Tool<CreatePolicySetInputShape, CreatePolicySetOutput> = {
  name: "create_policy_set",
  description:
        "Create a new policy set (named collection of tag + country-list entries). Once created, you can bind campaigns to it via `update_campaign`.",
      annotations: { title: "Create Policy Set", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  inputSchema: z.object(CreatePolicySetInputShape),
  handler: async (input, ctx): Promise<Result<CreatePolicySetOutput, ToolError>> => {
    const body = {
      name: input.name,
      entries: input.entries,
      ...(input.description !== undefined ? { description: input.description } : {}),
    };
    const result = await ctx.api.createPolicySet(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
