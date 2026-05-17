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

const CreateCustomRuleInputShape = {
  name: z.string().min(1).max(200).describe("Display name."),
  tag_slug: z
    .string()
    .max(100)
    .optional()
    .describe("Tag slug to assign on match. Empty = create-only (advanced)."),
  rule_type: z
    .string()
    .max(50)
    .describe("Rule engine: regex | substring | iab_category | etc. (API validates)."),
  config: z
    .record(z.unknown())
    .describe("Rule-type-specific configuration object. Shape depends on rule_type."),
  target: z
    .string()
    .max(30)
    .optional()
    .describe(
      "Where to apply the rule (e.g. 'page' for landing HTML). Default: page. See API docs for the full set of valid values."
    ),
} as const;
type CreateCustomRuleInputShape = typeof CreateCustomRuleInputShape;

export type CreateCustomRuleOutput = CustomRuleResponse;

export const createCustomRuleTool: Tool<CreateCustomRuleInputShape, CreateCustomRuleOutput> = {
  name: "create_custom_rule",
  description:
    "Define a custom tag-detection rule (regex / substring / category). Matches will tag every future scan; existing scans are untouched until you call `recheck_scans`.",
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
