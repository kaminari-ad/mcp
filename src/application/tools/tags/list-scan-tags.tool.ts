/**
 * Tool: `list_scan_tags` — every tag the checker pipeline attached
 * to one scan.
 */

import { z } from "zod";

import type { ScanTagResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListScanTagsInputShape = {
  scan_id: z.string().uuid().describe("Scan UUID."),
} as const;
type ListScanTagsInputShape = typeof ListScanTagsInputShape;

export interface ListScanTagsOutput {
  readonly items: readonly ScanTagResponse[];
  readonly total: number;
}

export const listScanTagsTool: Tool<ListScanTagsInputShape, ListScanTagsOutput> = {
  name: "list_scan_tags",
  description:
    "List every tag (system + custom) attached to one scan by the checker pipeline, with display name, category, and severity.",
  annotations: {
    title: "List Scan Tags",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListScanTagsInputShape),
  handler: async (input, ctx): Promise<Result<ListScanTagsOutput, ToolError>> => {
    const result = await ctx.api.listScanTags(input.scan_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
