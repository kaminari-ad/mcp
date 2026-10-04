/**
 * Tool: `test_custom_rules_batch` — preview-test many rules against
 * many stored scans in one call, without saving the rules.
 */

import { z } from "zod";

import type { RuleTestBatchResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { patternRuleInputError } from "./_pattern-rule-input.js";
import { patternAwareRuleConfigField } from "./_rule-config-input.js";

const TestCustomRulesBatchInputShape = {
  rules: z
    .array(
      z.object({
        id: z
          .string()
          .uuid()
          .optional()
          .describe(
            "Optional UUID you choose to tell rules apart in the reply; echoed back as rule_id. The API accepts only a UUID here. It is not looked up and does not select a saved rule."
          ),
        rule_type: z
          .string()
          .max(50)
          .describe(
            "Rule engine type. Same set as `test_custom_rule`: `stopword_content`, `stopword_url`, `regexp_content`, `regexp_url`, `regexp_request_url`, `regexp_request_body`, `blacklist_domain`, `combo`, `llm`."
          ),
        config: patternAwareRuleConfigField.describe(
          "Rule-type-specific config. Same shape as `test_custom_rule`'s `config`."
        ),
        target: z
          .string()
          .max(30)
          .default("page")
          .describe(
            "Where to apply the rule. Defaults to 'page'. `regexp_request_url` and `regexp_request_body` also accept 'creative' and 'creative_and_page'."
          ),
        name: z
          .string()
          .min(1)
          .max(200)
          .default("Test Rule")
          .describe(
            "Label the LLM prompt quotes as [USER RULE: \"<name>\"]. Same field as the single test. Defaults to 'Test Rule', which is what that test sends when name is omitted."
          ),
      })
    )
    .min(1)
    .max(20)
    .describe("Up to 20 rules. Every rule runs against every scan in `scan_ids`."),
  scan_ids: schemas.RuleTestBatchRequest.shape.scan_ids.describe(
    "Up to 50 stored scan UUIDs. Testing one rule against many scans is the usual case."
  ),
} as const;
type TestCustomRulesBatchInputShape = typeof TestCustomRulesBatchInputShape;

export type TestCustomRulesBatchOutput = RuleTestBatchResponse;

export const testCustomRulesBatchTool: Tool<
  TestCustomRulesBatchInputShape,
  TestCustomRulesBatchOutput
> = {
  name: "test_custom_rules_batch",
  description:
    "Preview-test up to 20 rule definitions against up to 50 stored scans in one call, without saving them. Returns one cell per rule and scan plus counts. A cell that could not run has `error` and `error_code` and never fails the rest: `deadline_exceeded` means the call ran out of time before that cell (about 110s per call) — call again with just those rules and scans; others are `timed_out`, `llm_failed`, `content_prohibited`, `scan_not_found`, `invalid_rule`, `failed`. A rate-limited error means this organization already has a batch running; wait for it. Many AI (`llm`) rules over many scans are better split across calls. Historical limits match `test_custom_rule`: `regexp_request_body` only has captured bodies for the last day, and `regexp_request_url` on a stored scan is best-effort.",
  annotations: {
    title: "Test Custom Rules Batch",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(TestCustomRulesBatchInputShape),
  handler: async (input, ctx): Promise<Result<TestCustomRulesBatchOutput, ToolError>> => {
    for (const [index, rule] of input.rules.entries()) {
      const inputError = patternRuleInputError(rule);
      if (inputError?.kind === "invalid-input") {
        const message = "rules[" + String(index) + "]: " + inputError.message;
        return err(
          inputError.fieldErrors === undefined
            ? { kind: "invalid-input", message }
            : { kind: "invalid-input", message, fieldErrors: inputError.fieldErrors }
        );
      }
    }
    const result = await ctx.api.testCustomRulesBatch({
      rules: input.rules.map((rule) => ({
        rule_type: rule.rule_type,
        config: rule.config,
        target: rule.target,
        name: rule.name,
        ...(rule.id === undefined ? {} : { id: rule.id }),
      })),
      scan_ids: input.scan_ids,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
