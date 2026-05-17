/**
 * Tool: `update_custom_rule` — patch any field of a rule. Sends a
 * PUT (full replace semantics on the API side), so all supplied
 * fields overwrite, all omitted fields remain unchanged from the
 * caller's perspective via this MCP wrapper (we forward only what
 * the agent provides).
 */

import { z } from "zod";

import type { CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateCustomRuleInputShape = {
  rule_id: z.string().uuid().describe("Rule UUID to update."),
  name: z.string().min(1).max(200).optional().describe("New display name."),
  tag_slug: z.string().max(100).optional().describe("New tag slug to assign on match."),
  config: z.record(z.unknown()).optional().describe("New rule-type-specific config object."),
  target: z
    .string()
    .max(30)
    .optional()
    .describe(
      "Where to apply the rule (e.g. 'page' for landing HTML). See API docs for the full set of valid values."
    ),
  is_active: z.boolean().optional().describe("Enable/disable the rule."),
} as const;
type UpdateCustomRuleInputShape = typeof UpdateCustomRuleInputShape;

export type UpdateCustomRuleOutput = CustomRuleResponse;

export const updateCustomRuleTool: Tool<UpdateCustomRuleInputShape, UpdateCustomRuleOutput> = {
  name: "update_custom_rule",
  description:
    "Update a custom tag-detection rule. Only supplied fields are sent. To toggle activation, pass `is_active`. Existing tagged scans are NOT re-evaluated — call `recheck_scans` for that. (Rule engine `rule_type` cannot be changed after creation; create a new rule instead.)",
  annotations: {
    title: "Update Custom Rule",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<UpdateCustomRuleOutput, ToolError>> => {
    const body: {
      name?: string;
      tag_slug?: string;
      config?: Record<string, unknown>;
      target?: string;
      is_active?: boolean;
    } = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.tag_slug !== undefined) body.tag_slug = input.tag_slug;
    if (input.config !== undefined) body.config = input.config;
    if (input.target !== undefined) body.target = input.target;
    if (input.is_active !== undefined) body.is_active = input.is_active;
    const result = await ctx.api.updateCustomRule(input.rule_id, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
