/**
 * Tool: `update_custom_rule` — patch any field of a rule. Sends a
 * PUT (full replace semantics on the API side), so all supplied
 * fields overwrite, all omitted fields remain unchanged from the
 * caller's perspective via this MCP wrapper (we forward only what
 * the agent provides).
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateCustomRuleInputShape = {
  rule_id: z.string().uuid().describe("Rule UUID to update."),
  name: z.string().min(1).max(200).optional().describe("New display name."),
  tag_slug: z.string().max(100).optional().describe("New tag slug to assign on match."),
  rule_type: z.string().max(50).optional().describe("Rule engine type."),
  config: z.record(z.unknown()).optional().describe("New rule-type-specific config object."),
  target: z.string().max(30).optional().describe("Where to apply: page / offer_url / html."),
  is_active: z.boolean().optional().describe("Enable/disable the rule."),
} as const;
type UpdateCustomRuleInputShape = typeof UpdateCustomRuleInputShape;

export type UpdateCustomRuleOutput = CustomRuleResponse;

export const updateCustomRuleTool: Tool<UpdateCustomRuleInputShape, UpdateCustomRuleOutput> = {
  name: "update_custom_rule",
  description:
    "Update a custom tag-detection rule. Only supplied fields are sent. To toggle activation, pass `is_active`. Existing tagged scans are NOT re-evaluated — call `recheck_scans` for that.",
  annotations: {
    title: "Update Custom Rule",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<UpdateCustomRuleOutput, ToolError>> => {
    const body = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.tag_slug !== undefined ? { tag_slug: input.tag_slug } : {}),
      ...(input.rule_type !== undefined ? { rule_type: input.rule_type } : {}),
      ...(input.config !== undefined ? { config: input.config } : {}),
      ...(input.target !== undefined ? { target: input.target } : {}),
      ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
    };
    const result = await ctx.api.updateCustomRule(input.rule_id, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
