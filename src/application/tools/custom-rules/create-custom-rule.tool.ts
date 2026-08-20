/**
 * Tool: `create_custom_rule` — define a new tag-detection rule.
 *
 * Wraps `POST /api/v1/custom-rules`. `config` shape is rule-type
 * specific; the API validates.
 */

import { z } from "zod";

import type { CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { COMBO_MATCH_SCOPE_DOC, ruleConfigField } from "./_rule-config-input.js";

const CreateCustomRuleInputShape = {
  name: z
    .string()
    .min(1)
    .max(200)
    .describe(
      "Display name. For non-LLM rules this also becomes the `display_name` of the auto-registered tag definition (see `tag_slug`)."
    ),
  tag_slug: z
    .string()
    .max(100)
    .optional()
    .describe(
      "Tag slug to assign on match. Empty = create-only (advanced). The API auto-registers a custom tag definition for this slug with `display_name = name`. **MUST NOT collide with a built-in system tag slug** (see `list_tags` where `scope=system`); colliding requests return 422 with code `checking.system_slug_reserved`. For `rule_type='llm'` use `config.tags` keys instead and leave `tag_slug` empty."
    ),
  rule_type: z
    .string()
    .max(50)
    .describe(
      "Rule engine. One of: `stopword_content`, `stopword_url`, `regexp_content`, `regexp_url`, `regexp_request_url`, `blacklist_domain`, `combo`, `llm`. `regexp_url` checks redirect-chain URLs only; `regexp_request_url` checks every captured network request URL, including subresources. The API validates."
    ),
  config: ruleConfigField.describe(
    "Rule-type-specific configuration object. Shape depends on `rule_type`. For `rule_type='regexp_request_url'`, use `{ pattern: string, flags: string }` with `target='page'`; it inspects all captured network and subresource URLs, while `regexp_url` remains redirect-chain-only. For `rule_type='llm'` the shape is `{ prompt: string, tags: { <tag_slug>: <description>, ... } }`; each key in `config.tags` is auto-registered as a custom tag definition AND must not collide with a system slug (same 422 contract as `tag_slug`). " +
      COMBO_MATCH_SCOPE_DOC
  ),
  target: z
    .string()
    .max(30)
    .optional()
    .describe(
      "Where to apply the rule (e.g. 'page' for landing HTML). `regexp_request_url` requires `target='page'`. Default: page. See API docs for the full set of valid values."
    ),
} as const;
type CreateCustomRuleInputShape = typeof CreateCustomRuleInputShape;

export type CreateCustomRuleOutput = CustomRuleResponse;

export const createCustomRuleTool: Tool<CreateCustomRuleInputShape, CreateCustomRuleOutput> = {
  name: "create_custom_rule",
  description:
    "Define a custom tag-detection rule. Use `rule_type='regexp_request_url'` with `config={ pattern: string, flags: string }` and `target='page'` to inspect all captured network request URLs, including subresources; `rule_type='regexp_url'` remains redirect-chain-only. The API auto-registers a tag definition for each slug the rule emits (`tag_slug` for non-LLM rules; `config.tags` keys for `rule_type='llm'`); slugs that collide with a built-in system tag are rejected with HTTP 422 / code `checking.system_slug_reserved`. For `rule_type='combo'` set `config.match_scope='url'` when the thresholds must be met inside one link instead of anywhere on the scan (default `'scan'`). Matches tag every future scan; existing scans are untouched until you call `recheck_scans`.",
  annotations: {
    title: "Create Custom Rule",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreateCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<CreateCustomRuleOutput, ToolError>> => {
    const body: {
      name: string;
      rule_type: string;
      config: Record<string, unknown>;
      tag_slug?: string;
      target?: string;
    } = {
      name: input.name,
      rule_type: input.rule_type,
      config: input.config,
    };
    if (input.tag_slug !== undefined) body.tag_slug = input.tag_slug;
    if (input.target !== undefined) body.target = input.target;
    const result = await ctx.api.createCustomRule(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
