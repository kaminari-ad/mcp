/**
 * Tool: `set_custom_rule_disabled_tags` — switch single tags of an AI
 * rule off for the caller's organization only.
 *
 * Wraps `PUT /api/v1/custom-rules/{id}/disabled-tags`.
 */

import { z } from "zod";

import type { CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const SetCustomRuleDisabledTagsInputShape = {
  rule_id: z
    .guid()
    .describe(
      "UUID of an AI rule (`rule_type` `llm`), from `list_custom_rules`: your own, System or shared."
    ),
  slugs: z
    .array(z.string().min(1).max(100))
    .max(200)
    .describe(
      "The FULL set of this rule's tags that must be off for your organization. Tags not listed are on; " +
        "`[]` switches every tag back on. Each slug must be a tag of the rule."
    ),
} as const;
type SetCustomRuleDisabledTagsInputShape = typeof SetCustomRuleDisabledTagsInputShape;

export type SetCustomRuleDisabledTagsOutput = CustomRuleResponse;

export const setCustomRuleDisabledTagsTool: Tool<
  SetCustomRuleDisabledTagsInputShape,
  SetCustomRuleDisabledTagsOutput
> = {
  name: "set_custom_rule_disabled_tags",
  description:
    "Switch single tags of an AI rule off for your organization only; the other tags keep working and " +
    "the description of an off tag is kept, so switching it back on needs no setup. " +
    "Works on your own, System and shared rules. New scans stop getting the off tags; tags already on past scans stay " +
    "until the scan is rechecked. " +
    "`slugs` replaces the whole off-set (read the current one from `disabled_tags` of `get_custom_rule`). " +
    "Before switching a tag off, read `tag_disable_impact` from `get_custom_rule`: it lists your combo rules that read that tag. " +
    "When every tag is off the rule reads `is_active: false`. Repeating the call is harmless.",
  annotations: {
    title: "Set Custom Rule Disabled Tags",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(SetCustomRuleDisabledTagsInputShape),
  handler: async (input, ctx): Promise<Result<SetCustomRuleDisabledTagsOutput, ToolError>> => {
    const result = await ctx.api.setCustomRuleDisabledTags(input.rule_id, input.slugs);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
