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
import { REQUEST_URL_RULE_CONFIG_DOC } from "./_request-url-rule-input.js";
import { COMBO_MATCH_SCOPE_DOC, requestUrlAwareRuleConfigField } from "./_rule-config-input.js";

const UpdateCustomRuleInputShape = {
  rule_id: z.string().uuid().describe("Rule UUID to update."),
  name: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe(
      "New rule display name. For PERSONAL non-LLM rules this refreshes the auto-registered tag's display name. A same-slug GLOBAL rule keeps its separately managed tag metadata unchanged; use `update_tag_definition` for that tag."
    ),
  tag_slug: z
    .string()
    .max(100)
    .optional()
    .describe(
      "New tag slug to assign on match. **MUST NOT collide with a built-in system tag slug** (see `list_tags` where `scope=system`); colliding requests return 422 with code `checking.system_slug_reserved`. Leaving a GLOBAL rule on the same slug preserves its admin-managed tag metadata."
    ),
  config: requestUrlAwareRuleConfigField
    .optional()
    .describe(
      "New rule-type-specific config object. Replaces the stored config wholesale — resend every key you want to keep, including a combo rule's `match_scope`. For `rule_type='llm'` the keys of `config.tags` are auto-registered as tag definitions; any key that collides with a system slug returns the same 422 contract. " +
        REQUEST_URL_RULE_CONFIG_DOC +
        " Read the rule first because `rule_type` is immutable and is not repeated in this update input. " +
        COMBO_MATCH_SCOPE_DOC
    ),
  target: z
    .string()
    .max(30)
    .optional()
    .describe(
      "Where to apply the rule. `regexp_request_url` is fixed to `page`; do not change it. See API docs for the valid targets of other rule types."
    ),
  is_active: z.boolean().optional().describe("Enable/disable the rule."),
} as const;
type UpdateCustomRuleInputShape = typeof UpdateCustomRuleInputShape;

export type UpdateCustomRuleOutput = CustomRuleResponse;

export const updateCustomRuleTool: Tool<UpdateCustomRuleInputShape, UpdateCustomRuleOutput> = {
  name: "update_custom_rule",
  description:
    "Update a custom tag-detection rule. Only supplied fields are sent, but `config` replaces the stored object wholesale; read the rule first and resend every required key. `regexp_request_url` needs a non-empty pattern (max 4,096), flags `''`/`'i'`, and the fixed `page` target. Same-slug GLOBAL rule edits preserve separately managed tag metadata; use `update_tag_definition` to change it. Existing scans are not re-evaluated until `recheck_scans`.",
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
