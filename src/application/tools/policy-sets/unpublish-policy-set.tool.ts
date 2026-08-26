/**
 * Tool: `unpublish_policy_set` — take a set back out of the public
 * catalog, or withdraw a publication request still under review.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UnpublishPolicySetInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
} as const;
type UnpublishPolicySetInputShape = typeof UnpublishPolicySetInputShape;

export interface UnpublishPolicySetOutput {
  readonly unpublished: true;
}

export const unpublishPolicySetTool: Tool<UnpublishPolicySetInputShape, UnpublishPolicySetOutput> =
  {
    name: "unpublish_policy_set",
    description:
      "Return one of your organization's policy sets to PRIVATE. Inverse of request_policy_set_approval: removes an approved set from the shared catalog other organizations browse, or withdraws a publication request that is still awaiting review. The set stays fully usable inside your own organization. Campaigns in other organizations that already reference the set keep their binding — going private blocks new attachments rather than breaking existing ones. Safe to call on a set that is already private.",
    annotations: {
      title: "Unpublish Policy Set",
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: z.object(UnpublishPolicySetInputShape),
    handler: async (input, ctx): Promise<Result<UnpublishPolicySetOutput, ToolError>> => {
      // API returns 204 No Content on success.
      const result = await ctx.api.unpublishPolicySet(input.policy_set_id);
      if (result.isErr()) return err(mapApiError(result.error));
      return ok({ unpublished: true });
    },
  };
