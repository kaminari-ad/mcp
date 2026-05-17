/**
 * Tool: `delete_policy_set` — permanently remove a policy set.
 *
 * NOTE: API returns HTTP 400 ("Policy set is in use by campaigns")
 * if any active campaign is still bound to this set. To unbind: call
 * `list_campaigns` filtered by `policy_set_id`, then `update_campaign`
 * for each match setting `policy_set_id=null`, then retry delete.
 * Alerts created under the deleted set persist (their `policy_set_id`
 * becomes `null`).
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const DeletePolicySetInputShape = {
  policy_set_id: z.string().uuid().describe("Policy set UUID."),
} as const;
type DeletePolicySetInputShape = typeof DeletePolicySetInputShape;

export interface DeletePolicySetOutput {
  readonly deleted: true;
}

export const deletePolicySetTool: Tool<DeletePolicySetInputShape, DeletePolicySetOutput> = {
  name: "delete_policy_set",
  description:
    "Permanently delete a policy set. IMPORTANT: API returns HTTP 400 if any active campaign is still bound to this set. To unbind first, call `list_campaigns` with a `policy_set_id` filter (when available) or scan your campaigns for matches, then `update_campaign` for each match setting `policy_set_id=null`, then retry delete. Alerts created under this set persist (their `policy_set_id` becomes `null`).",
  annotations: {
    title: "Delete Policy Set",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(DeletePolicySetInputShape),
  handler: async (input, ctx): Promise<Result<DeletePolicySetOutput, ToolError>> => {
    const result = await ctx.api.deletePolicySet(input.policy_set_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ deleted: true });
  },
};
