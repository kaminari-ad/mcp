/**
 * Tool: `get_policy_set` — one policy set with its full entry list.
 */

import { z } from "zod";

import type { PolicySetResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetPolicySetInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
} as const;
type GetPolicySetInputShape = typeof GetPolicySetInputShape;

export type GetPolicySetOutput = PolicySetResponse;

export const getPolicySetTool: Tool<GetPolicySetInputShape, GetPolicySetOutput> = {
  name: "get_policy_set",
  description:
    "Get one policy set by UUID with its complete list of entries (each entry is one of five rule kinds — tag / iab_v3 / brand / ai_category / custom_taxonomy — plus applicable country codes). `is_default` is true when this owned set is the organization's default for new campaigns.",
  annotations: {
    title: "Get Policy Set",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetPolicySetInputShape),
  handler: async (input, ctx): Promise<Result<GetPolicySetOutput, ToolError>> => {
    const result = await ctx.api.getPolicySet(input.policy_set_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
