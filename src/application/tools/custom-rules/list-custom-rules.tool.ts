/**
 * Tool: `list_custom_rules` — org custom rule list.
 *
 * API endpoint: `GET /api/v1/custom-rules` returns a flat array (no
 * pagination per OpenAPI), so the tool surfaces all rules at once.
 */

import { z } from "zod";

import type { CustomRuleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCustomRulesInputShape = {
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListCustomRulesInputShape = typeof ListCustomRulesInputShape;

export interface ListCustomRulesOutput {
  readonly items: readonly CustomRuleResponse[];
  readonly total: number;
}

export const listCustomRulesTool: Tool<ListCustomRulesInputShape, ListCustomRulesOutput> = {
  name: "list_custom_rules",
  description:
    "List the organization's custom tag-detection rules (regex / heuristics) with their config, target, and active flag.",
  annotations: {
    title: "List Custom Rules",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListCustomRulesInputShape),
  handler: async (input, ctx): Promise<Result<ListCustomRulesOutput, ToolError>> => {
    const result = await ctx.api.listCustomRules({ page: input.page, limit: input.limit });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
