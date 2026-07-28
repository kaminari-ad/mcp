/**
 * Shared zod field for a custom rule's `config` object, plus the
 * agent-facing prose for the combo `match_scope` key.
 *
 * `create_custom_rule`, `update_custom_rule`, and `test_custom_rule`
 * forward `config` verbatim — its shape is rule-type specific and the
 * API validates it. Owning the field and the `match_scope` wording
 * here keeps all five custom-rule tools (the three writers plus the
 * `get_custom_rule` / `list_custom_rules` readers) in sync.
 *
 * `match_scope` is the one value checked client-side. The API validates
 * it as well (create, update, and the rule-test preview), so this is
 * early feedback for the agent, not the durable guarantee — the rest of
 * a combo config is validated only for admin-authored system rules.
 */

import { z } from "zod";

/**
 * Agent-facing documentation of the combo-rule `match_scope` key.
 * Appended to the `config` description of every tool that accepts one.
 */
export const COMBO_MATCH_SCOPE_DOC =
  "For `rule_type='combo'` the optional rule-level key `match_scope` decides where conditions are counted. `\"scan\"` (the default, and the behaviour when the key is absent) checks them against the union of all tags on the scan. " +
  'With `"url"`, every condition must be satisfied by tags on the same link, and the tag is assigned to that link — so a rule built only from link-less tags (AI verdicts, crawler behaviour) has no link to attach to and will never match; keep those on the whole scan. ' +
  "Mixing the two kinds does not help either: AI verdicts and per-link detections reach the engine in different scan parts and are not evaluated together today, so such a combo fires under neither scope. " +
  'Give a `"url"` rule at least one positive condition (`all_of` / `any_of` / `tag_category` + `count_gte`) — a config carrying only `none_of` matches every link that merely lacks those tags, and the API does not reject that on this path. ' +
  'Thresholds stay "N or more" (`count_gte` / `any_of_min`) in both scopes; no other `match_scope` value is accepted.';

/**
 * Agent-facing note for the read tools (`get_custom_rule`,
 * `list_custom_rules`), whose returned `config` carries `match_scope`
 * verbatim. Warns about the read-modify-write trap: `update_custom_rule`
 * replaces `config` wholesale, so echoing back a config without the key
 * silently reverts the rule to whole-scan matching.
 */
export const COMBO_MATCH_SCOPE_READ_DOC =
  'For `rule_type=\'combo\'` the returned `config` may carry the rule-level key `match_scope` ("scan" = count conditions across the whole scan, "url" = every condition must be satisfied by tags on the same link). ' +
  "Resend it verbatim when updating: `update_custom_rule` replaces `config` wholesale, so dropping the key reverts the rule to whole-scan matching.";

/**
 * Open record for a rule config, rejecting an out-of-range combo
 * `match_scope` before the request leaves the process. Each tool calls
 * `.describe(...)` on it to add its own prose.
 */
export const ruleConfigField = z.record(z.unknown()).superRefine((config, ctx) => {
  const scope = config["match_scope"];
  if (scope === undefined || scope === "scan" || scope === "url") {
    return;
  }
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["match_scope"],
    message:
      'config.match_scope must be "scan" or "url". Omit the key for scan-wide matching (the default).',
  });
});
