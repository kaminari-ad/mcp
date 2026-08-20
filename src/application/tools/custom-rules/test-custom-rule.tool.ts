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
import {
  REQUEST_URL_RULE_CONFIG_DOC,
  requestUrlRuleInputError,
} from "./_request-url-rule-input.js";
import { COMBO_MATCH_SCOPE_DOC, requestUrlAwareRuleConfigField } from "./_rule-config-input.js";

const TestCustomRuleInputShape = {
  rule_type: z
    .string()
    .max(50)
    .describe(
      "Rule engine type. One of: `stopword_content`, `stopword_url`, `regexp_content`, `regexp_url`, `regexp_request_url`, `blacklist_domain`, `combo`, `llm`. `regexp_url` checks redirect-chain URLs only; `regexp_request_url` checks captured network and subresource URLs."
    ),
  config: requestUrlAwareRuleConfigField.describe(
    "Rule-type-specific config to test. Same shape as `create_custom_rule`'s `config`. " +
      REQUEST_URL_RULE_CONFIG_DOC +
      " `regexp_url` remains redirect-chain-only. NOTE: `test_custom_rule` evaluates the rule against a scan WITHOUT persisting it, so slug-collision validation does NOT run here — verify slugs against `list_tags` (`scope=system`) before promoting to `create_custom_rule`. " +
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
    "Preview-test a rule definition against a stored scan without persisting it. For `regexp_request_url`, the historical snapshot contains main-frame hops plus at most 200 persisted subrequests with selected resource types omitted, so a no-match does not prove the original fresh scan lacked the request. Returns match state, elapsed time, and per-tag detail; the preview response does not expose the matched request URL separately. Slug-collision validation does not run in preview mode.",
  annotations: {
    title: "Test Custom Rule",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(TestCustomRuleInputShape),
  handler: async (input, ctx): Promise<Result<TestCustomRuleOutput, ToolError>> => {
    const inputError = requestUrlRuleInputError(input);
    if (inputError) return err(inputError);
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
