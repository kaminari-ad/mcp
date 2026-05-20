/**
 * Tool: `list_policy_sets` — paginated policy-set list.
 *
 * Policy sets define which tags are considered violations in which
 * countries; campaigns bind to one policy set. List items omit
 * `entries` (the tag/country bindings) for payload size — fetch a
 * single set via `get_policy_set` when you need them. Use
 * `page` / `limit` to iterate; `total` tells you the org's full
 * policy-set count.
 */

import { z } from "zod";

import type {
  PaginatedResponse,
  PolicySetListItemResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListPolicySetsInputShape = {
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
  visibility: z
    .enum(["private", "public", "all"])
    .optional()
    .describe(
      "Filter by visibility scope: private = org-owned only (default if omitted); public = Kaminari.Ad-curated sets visible to every org; all = both."
    ),
} as const;
type ListPolicySetsInputShape = typeof ListPolicySetsInputShape;

export type ListPolicySetsOutput = PaginatedResponse<PolicySetListItemResponse>;

export const listPolicySetsTool: Tool<ListPolicySetsInputShape, ListPolicySetsOutput> = {
  name: "list_policy_sets",
  description:
    "Paginated list of policy sets: named collections of violation rules (tag / IAB V3 / brand / AI category / custom-taxonomy entries) that define what counts as a violation. Campaigns bind to one policy set. Returns `{items, total, page, limit}`. List items omit `entries` for payload size — fetch a single set via `get_policy_set` when you need them. Use `visibility=public` to discover Kaminari.Ad-curated sets.",
  annotations: {
    title: "List Policy Sets",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListPolicySetsInputShape),
  handler: async (input, ctx): Promise<Result<ListPolicySetsOutput, ToolError>> => {
    const result = await ctx.api.listPolicySets({
      page: input.page,
      limit: input.limit,
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
