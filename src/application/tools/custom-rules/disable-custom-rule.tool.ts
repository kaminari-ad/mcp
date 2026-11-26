/**
 * Tool: `disable_custom_rule` — switch a System or shared rule off for
 * the caller's organization only.
 *
 * Wraps `POST /api/v1/custom-rules/{id}/disable`.
 */

import { z } from "zod";

import type { CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const DisableCustomRuleInputShape = {
  rule_id: z.guid().describe("UUID of a System or shared rule, from `list_custom_rules`."),
} as const;
type DisableCustomRuleInputShape = typeof DisableCustomRuleInputShape;

export type DisableCustomRuleOutput = CustomRuleResponse;

export const disableCustomRuleTool: Tool<DisableCustomRuleInputShape, DisableCustomRuleOutput> = {
  name: "disable_custom_rule",
  description:
    "Switch a System or shared (other organization's) custom rule off for your organization only. " +
    "New scans stop getting its tags; tags already on past scans stay until the scan is rechecked (`recheck_scans`). " +
    "Read `disable_impact` from `list_custom_rules` or `get_custom_rule` first: it names the combo rules in effect for you " +
    "(yours, System and shared) that read the rule's tag, and `security: true` means disabling it may let malicious ads go undetected. " +
    "Your own rules are switched with `update_custom_rule` (`is_active`), not here. Repeating the call is harmless.",
  annotations: {
    title: "Disable Custom Rule",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(DisableCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<DisableCustomRuleOutput, ToolError>> => {
    const result = await ctx.api.disableCustomRule(input.rule_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
