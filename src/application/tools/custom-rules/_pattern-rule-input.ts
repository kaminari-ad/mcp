/**
 * Contract helpers for the rule types whose whole config is one regex.
 *
 * `regexp_request_url` matches the URLs a crawl requested;
 * `regexp_request_body` matches what those sub-resources CONTAINED. Same
 * `{pattern, flags}` config, same fixed `page` target, so they share one
 * guard — and the api validates them through one validator too.
 */

import { z } from "zod";

import type { ToolError } from "../_shared/tool-result.js";

export const PATTERN_RULE_TYPES = ["regexp_request_url", "regexp_request_body"] as const;

export const patternRuleConfigSchema = z
  .object({
    pattern: z
      .string()
      .min(1)
      .max(4096)
      .describe("Non-empty regular expression, at most 4,096 characters."),
    flags: z
      .enum(["", "i"])
      .optional()
      .describe("Omit or use '' for case-sensitive matching; use 'i' to ignore case."),
  })
  .strict();

export const PATTERN_RULE_CONFIG_DOC =
  "For `rule_type='regexp_request_url'` and `rule_type='regexp_request_body'`, `config` must be exactly `{ pattern: string, flags?: '' | 'i' }`: pattern is non-empty and at most 4,096 characters; omit flags or use `''` for case-sensitive matching, or `'i'` for case-insensitive matching. `target` must be `'page'` for both. " +
  "`regexp_request_url` inspects up to 5,000 captured request URLs on a fresh scan; tests and rechecks of stored scans reconstruct main-frame hops plus up to 200 persisted subrequests with selected resource types omitted, so historical matching is best-effort. " +
  "`regexp_request_body` inspects the CONTENTS of the page's scripts, fetch/XHR responses and iframe documents — never images, video, fonts or stylesheets — capped at 400 resources, 128 KB each and 8 MB per scan. Those contents are kept for ONE DAY, so a test or recheck against an older scan reports no match because there is nothing left to read.";

interface PatternRuleInput {
  readonly rule_type: string;
  readonly config: Record<string, unknown>;
  readonly target?: string | undefined;
}

function isPatternRuleType(ruleType: string): boolean {
  return PATTERN_RULE_TYPES.some((known) => known === ruleType);
}

/** Return a local tool error when a pattern rule violates its fixed contract. */
export function patternRuleInputError(input: PatternRuleInput): ToolError | null {
  if (!isPatternRuleType(input.rule_type)) return null;
  if (input.target !== undefined && input.target !== "page") {
    return {
      kind: "invalid-input",
      message: `${input.rule_type} requires target='page'.`,
      fieldErrors: { target: [`Must be 'page' for ${input.rule_type}.`] },
    };
  }

  const parsed = patternRuleConfigSchema.safeParse(input.config);
  if (parsed.success) return null;
  const issue = parsed.error.issues[0];
  const field = issue?.path.length ? `config.${issue.path.join(".")}` : "config";
  const message = issue?.message ?? "Invalid pattern rule config.";
  return {
    kind: "invalid-input",
    message: `Invalid ${input.rule_type} config: ${message}`,
    fieldErrors: { [field]: [message] },
  };
}
