/**
 * Tool: `request_policy_set_approval` — submit the set for review so
 * it can be used in PUBLIC scope (other organizations can subscribe).
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const RequestPolicySetApprovalInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
} as const;
type RequestPolicySetApprovalInputShape = typeof RequestPolicySetApprovalInputShape;

export interface RequestPolicySetApprovalOutput {
  readonly requested: true;
}

export const requestPolicySetApprovalTool: Tool<
  RequestPolicySetApprovalInputShape,
  RequestPolicySetApprovalOutput
> = {
  name: "request_policy_set_approval",
  description:
    "Submit a private policy set for Kaminari.Ad team review so it can be marked PUBLIC and used by other organizations. The set must be complete and well-formed. Returns immediately; approval status is reflected on the policy set entity once the review completes.",
  annotations: {
    title: "Request Policy Set Approval",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(RequestPolicySetApprovalInputShape),
  handler: async (input, ctx): Promise<Result<RequestPolicySetApprovalOutput, ToolError>> => {
    // API returns 204 No Content on success.
    const result = await ctx.api.requestPolicySetApproval(input.policy_set_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ requested: true });
  },
};
