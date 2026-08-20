/** Contract helpers for `regexp_request_url` tool inputs. */

import { z } from "zod";

import type { ToolError } from "../_shared/tool-result.js";

export const requestUrlRuleConfigSchema = z
  .object({
    pattern: z
      .string()
      .min(1)
      .max(4096)
      .describe("Non-empty request-URL regular expression, at most 4,096 characters."),
    flags: z
      .enum(["", "i"])
      .optional()
      .describe("Omit or use '' for case-sensitive matching; use 'i' to ignore case."),
  })
  .strict();

export const REQUEST_URL_RULE_CONFIG_DOC =
  "For `rule_type='regexp_request_url'`, `config` must be exactly `{ pattern: string, flags?: '' | 'i' }`: pattern is non-empty and at most 4,096 characters; omit flags or use `''` for case-sensitive matching, or `'i'` for case-insensitive matching. `target` must be `'page'`. Fresh scans inspect up to 5,000 captured request URLs. Tests and rechecks of stored scans reconstruct main-frame hops plus up to 200 persisted subrequests with selected resource types omitted, so historical matching is best-effort.";

interface RequestUrlRuleInput {
  readonly rule_type: string;
  readonly config: Record<string, unknown>;
  readonly target?: string | undefined;
}

/** Return a local tool error when a request-URL rule violates its fixed contract. */
export function requestUrlRuleInputError(input: RequestUrlRuleInput): ToolError | null {
  if (input.rule_type !== "regexp_request_url") return null;
  if (input.target !== undefined && input.target !== "page") {
    return {
      kind: "invalid-input",
      message: "regexp_request_url requires target='page'.",
      fieldErrors: { target: ["Must be 'page' for regexp_request_url."] },
    };
  }

  const parsed = requestUrlRuleConfigSchema.safeParse(input.config);
  if (parsed.success) return null;
  const issue = parsed.error.issues[0];
  const field = issue?.path.length ? `config.${issue.path.join(".")}` : "config";
  const message = issue?.message ?? "Invalid request-URL rule config.";
  return {
    kind: "invalid-input",
    message: `Invalid regexp_request_url config: ${message}`,
    fieldErrors: { [field]: [message] },
  };
}
