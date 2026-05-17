/**
 * Tool: `list_policy_sets` — all policy sets for the caller's org.
 *
 * Policy sets define which tags are considered violations in which
 * countries; campaigns bind to one policy set.
 */

import { z } from "zod";

import type { PolicySetResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListPolicySetsInputShape = {} as const;
type ListPolicySetsInputShape = typeof ListPolicySetsInputShape;

export interface ListPolicySetsOutput {
  readonly items: readonly PolicySetResponse[];
  readonly total: number;
}

export const listPolicySetsTool: Tool<ListPolicySetsInputShape, ListPolicySetsOutput> = {
  name: "list_policy_sets",
  description:
    "List policy sets: named collections of (tag, country-list) entries that define what counts as a violation. Campaigns bind to one policy set.",
  annotations: {
    title: "List Policy Sets",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListPolicySetsInputShape),
  handler: async (_input, ctx): Promise<Result<ListPolicySetsOutput, ToolError>> => {
    const result = await ctx.api.listPolicySets();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
