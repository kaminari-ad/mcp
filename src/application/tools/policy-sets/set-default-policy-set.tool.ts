/**
 * Tool: `set_default_policy_set` — mark or clear the org default used
 * when creating campaigns that omit `policy_set_id`.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const SetDefaultPolicySetInputShape = {
  policy_set_id: z.string().uuid().describe("Owned policy set UUID."),
  is_default: z
    .boolean()
    .describe(
      "True makes this the organization's default for new campaigns (clearing any previous default). False clears the flag on this set and leaves the org without a default."
    ),
} as const;
type SetDefaultPolicySetInputShape = typeof SetDefaultPolicySetInputShape;

export interface SetDefaultPolicySetOutput {
  readonly is_default: boolean;
}

export const setDefaultPolicySetTool: Tool<
  SetDefaultPolicySetInputShape,
  SetDefaultPolicySetOutput
> = {
  name: "set_default_policy_set",
  description:
    "Mark or clear one of your organization's policy sets as the default for new campaigns. At most one owned set may be default. Creating a campaign without `policy_set_id` then binds this set (or stays unbound if none is set). Pass `policy_set_id: null` on create_campaign to opt out of the default. Foreign public sets cannot be made default. The API returns 204; this tool echoes `is_default`.",
  annotations: {
    title: "Set Default Policy Set",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(SetDefaultPolicySetInputShape),
  handler: async (input, ctx): Promise<Result<SetDefaultPolicySetOutput, ToolError>> => {
    const result = await ctx.api.setDefaultPolicySet(input.policy_set_id, input.is_default);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ is_default: input.is_default });
  },
};
