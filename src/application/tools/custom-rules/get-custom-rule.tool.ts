/**
 * Tool: `get_custom_rule` — full config of one rule.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetCustomRuleInputShape = { rule_id: z.string().uuid().describe("Rule UUID.") } as const;
type GetCustomRuleInputShape = typeof GetCustomRuleInputShape;

export type GetCustomRuleOutput = CustomRuleResponse;

export const getCustomRuleTool: Tool<GetCustomRuleInputShape, GetCustomRuleOutput> = {
  name: "get_custom_rule",
  description: "Get one custom rule by UUID with name, tag-slug, type, config object, target, active flag.",
  annotations: {
    title: "Get Custom Rule",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<GetCustomRuleOutput, ToolError>> => {
    const result = await ctx.api.getCustomRule(input.rule_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
