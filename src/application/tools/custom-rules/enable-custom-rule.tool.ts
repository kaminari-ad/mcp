/**
 * Tool: `enable_custom_rule` — switch a System or shared rule back on
 * for the caller's organization.
 *
 * Wraps `POST /api/v1/custom-rules/{id}/enable`.
 */

import { z } from "zod";

import type { CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const EnableCustomRuleInputShape = {
  rule_id: z.guid().describe("UUID of a System or shared rule, from `list_custom_rules`."),
} as const;
type EnableCustomRuleInputShape = typeof EnableCustomRuleInputShape;

export type EnableCustomRuleOutput = CustomRuleResponse;

export const enableCustomRuleTool: Tool<EnableCustomRuleInputShape, EnableCustomRuleOutput> = {
  name: "enable_custom_rule",
  description:
    "Switch a System or shared custom rule back on for your organization. New scans get its tags again; " +
    "scans made while it was off are not re-tagged until you re-check them (`recheck_scans`). " +
    "Your own rules are switched with `update_custom_rule` (`is_active`), not here. Repeating the call is harmless.",
  annotations: {
    title: "Enable Custom Rule",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(EnableCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<EnableCustomRuleOutput, ToolError>> => {
    const result = await ctx.api.enableCustomRule(input.rule_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
