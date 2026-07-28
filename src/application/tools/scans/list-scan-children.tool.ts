/**
 * Tool: `list_scan_children` — discovered-ad child scans of a publisher scan.
 *
 * Wraps `GET /api/v1/scans/{scan_id}/children`. Returns the child scans a
 * publisher ad-discovery scan (`ad_discovery=true`) spawned — one per
 * detected ad block. Each child brief carries `ad_kind` (banner|pop),
 * `network`, and `slot_index`.
 */

import { z } from "zod";

import type { PaginatedResponse, ScanBriefResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListScanChildrenInputShape = {
  scan_id: z
    .string()
    .uuid()
    .describe("The publisher scan's UUID (an ad-discovery scan created with ad_discovery=true)."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size (1-200). Default 50."),
} as const;
type ListScanChildrenInputShape = typeof ListScanChildrenInputShape;

export type ListScanChildrenOutput = PaginatedResponse<ScanBriefResponse>;

export const listScanChildrenTool: Tool<ListScanChildrenInputShape, ListScanChildrenOutput> = {
  name: "list_scan_children",
  description:
    "List the discovered-ad child scans of a publisher ad-discovery scan — one per detected ad block on the page. Each child brief carries ad_kind (banner|pop), the attributed ad network, slot_index, and the repeat / retry fields (`repeat_index` / `repeat_total` for its position in a repeat group, `repeat_session_id`, `retry_attempt` / `retry_max_attempts`) — note that ad discovery never runs in `shared` repeat mode, so `repeat_session_id` is always null here. Returns a paginated envelope with screenshot + report deep-links; link users with those, never hand-build URLs.",
  annotations: {
    title: "List Scan Children",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListScanChildrenInputShape),
  handler: async (input, ctx): Promise<Result<ListScanChildrenOutput, ToolError>> => {
    const result = await ctx.api.listScanChildren(input.scan_id, {
      page: input.page,
      limit: input.limit,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
