/**
 * Tool: `list_custom_rules` — paginated org custom-rule list.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type {
  CustomRuleResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCustomRulesInputShape = {
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListCustomRulesInputShape = typeof ListCustomRulesInputShape;

export type ListCustomRulesOutput = PaginatedResponse<CustomRuleResponse>;

export const listCustomRulesTool: Tool<ListCustomRulesInputShape, ListCustomRulesOutput> = {
  name: "list_custom_rules",
  description:
        "List the organization's custom tag-detection rules (regex / heuristics) with their config, target, and active flag.",
      annotations: { title: "List Custom Rules", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(ListCustomRulesInputShape),
  handler: async (input, ctx): Promise<Result<ListCustomRulesOutput, ToolError>> => {
    const result = await ctx.api.listCustomRules({ page: input.page, limit: input.limit });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
