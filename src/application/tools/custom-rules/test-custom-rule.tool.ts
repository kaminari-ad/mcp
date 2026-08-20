/**
 * Tool: `test_custom_rule` — preview-test a rule config against an
 * existing scan, without saving the rule. Useful for "would this
 * regex match my malware example?"
 */

import { z } from "zod";

import type { RuleTestResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { COMBO_MATCH_SCOPE_DOC, ruleConfigField } from "./_rule-config-input.js";

const TestCustomRuleInputShape = {
  rule_type: z
    .string()
    .max(50)
    .describe(
      "Rule engine type. One of: `stopword_content`, `stopword_url`, `regexp_content`, `regexp_url`, `regexp_request_url`, `blacklist_domain`, `combo`, `llm`. `regexp_url` checks redirect-chain URLs only; `regexp_request_url` checks every captured network request URL, including subresources."
    ),
  config: ruleConfigField.describe(
    "Rule-type-specific config to test. Same shape as `create_custom_rule`'s `config`. For `rule_type='regexp_request_url'`, use `{ pattern: string, flags: string }` with `target='page'`; it inspects all captured network and subresource URLs, while `regexp_url` remains redirect-chain-only. NOTE: `test_custom_rule` evaluates the rule against a scan WITHOUT persisting it, so slug-collision validation does NOT run here — verify slugs against `list_tags` (`scope=system`) before promoting to `create_custom_rule`. " +
      COMBO_MATCH_SCOPE_DOC
  ),
  target: z
    .string()
    .max(30)
    .describe(
      "Where to apply the rule (e.g. 'page' for landing HTML). `regexp_request_url` requires `target='page'`. See API docs for the full set of valid values."
    ),
  scan_id: z.string().uuid().describe("Existing scan UUID to evaluate the rule against."),
} as const;
type TestCustomRuleInputShape = typeof TestCustomRuleInputShape;

export type TestCustomRuleOutput = RuleTestResponse;

export const testCustomRuleTool: Tool<TestCustomRuleInputShape, TestCustomRuleOutput> = {
  name: "test_custom_rule",
  description:
    "Preview-test a rule definition against an existing scan WITHOUT persisting the rule. Use `rule_type='regexp_request_url'` with `config={ pattern: string, flags: string }` and `target='page'` to inspect all captured network request URLs, including subresources; `rule_type='regexp_url'` remains redirect-chain-only. Returns `matched: bool`, evaluation time, and per-tag-slug details; a request-URL match includes the first matching request URL in its detail. Use to validate config before `create_custom_rule`. Combo rules are evaluated against the scan's existing tags, so `config.match_scope` is honoured — but per-URL hits are collapsed to one row per tag slug, so the result says whether the rule fires, not which URLs it would tag. NOTE: slug-collision validation does NOT run in preview mode — verify any `tag_slug` (or LLM `config.tags` keys) against `list_tags` (`scope=system`) before promoting to `create_custom_rule`, which would otherwise reject the same payload with HTTP 422 / code `checking.system_slug_reserved`.",
  annotations: {
    title: "Test Custom Rule",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(TestCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<TestCustomRuleOutput, ToolError>> => {
    const result = await ctx.api.testCustomRule({
      rule_type: input.rule_type,
      config: input.config,
      target: input.target,
      scan_id: input.scan_id,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
