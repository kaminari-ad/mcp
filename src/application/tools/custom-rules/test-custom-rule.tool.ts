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

const TestCustomRuleInputShape = {
  rule_type: z.string().max(50).describe("Rule engine type (regex, substring, ...)."),
  config: z.record(z.unknown()).describe("Rule-type-specific config to test."),
  target: z.string().max(30).describe("Where to apply the rule: page / offer_url / html."),
  scan_id: z.string().uuid().describe("Existing scan UUID to evaluate the rule against."),
} as const;
type TestCustomRuleInputShape = typeof TestCustomRuleInputShape;

export type TestCustomRuleOutput = RuleTestResponse;

export const testCustomRuleTool: Tool<TestCustomRuleInputShape, TestCustomRuleOutput> = {
  name: "test_custom_rule",
  description:
    "Preview-test a rule definition against an existing scan WITHOUT persisting the rule. Returns `matched: bool`, evaluation time, and per-tag-slug details. Use to validate config before `create_custom_rule`.",
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
