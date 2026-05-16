/**
 * Tool: `delete_custom_rule` — permanently remove a rule.
 *
 * Wraps `DELETE /api/v1/custom-rules/{id}`. Past scans keep any tag
 * the rule produced; future scans won't get the tag.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const DeleteCustomRuleInputShape = {
  rule_id: z.string().uuid().describe("Rule UUID to delete."),
} as const;
type DeleteCustomRuleInputShape = typeof DeleteCustomRuleInputShape;

export interface DeleteCustomRuleOutput {
  readonly deleted: true;
}

export const deleteCustomRuleTool: Tool<DeleteCustomRuleInputShape, DeleteCustomRuleOutput> = {
  name: "delete_custom_rule",
  description:
        "Permanently delete a custom rule. Already-applied tags on past scans are preserved; the rule simply stops running on future scans.",
      annotations: { title: "Delete Custom Rule", readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(DeleteCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<DeleteCustomRuleOutput, ToolError>> => {
    const result = await ctx.api.deleteCustomRule(input.rule_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ deleted: true });
  },
};
