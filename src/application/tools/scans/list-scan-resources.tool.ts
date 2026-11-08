/**
 * Tool: `list_scan_resources` — what a scan captured on one surface, without
 * the bodies. Pair with `get_scan_resource_body` to read one.
 */

import { z } from "zod";

import type { CapturedResource, PaginatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import {
  CAPTURED_CONTENTS_DOC,
  resourceSurfaceInputShape,
  toResourceSurface,
} from "./_resource-surface-input.js";

const ListScanResourcesInputShape = {
  ...resourceSurfaceInputShape,
  resource_type: z
    .enum(["script", "xhr", "fetch", "document"])
    .optional()
    .describe("Only this kind of resource; `document` is a child frame."),
  url_contains: z
    .string()
    .min(1)
    .max(2048)
    .optional()
    .describe("Only resources whose URL contains this text (case-insensitive)."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size (1-200). Default 50."),
} as const;
type ListScanResourcesInputShape = typeof ListScanResourcesInputShape;

export type ListScanResourcesOutput = PaginatedResponse<CapturedResource>;

function matches(
  row: CapturedResource,
  resourceType: string | undefined,
  urlContains: string | undefined
): boolean {
  if (resourceType !== undefined && row.resource_type !== resourceType) return false;
  return urlContains === undefined || row.url.toLowerCase().includes(urlContains.toLowerCase());
}

export const listScanResourcesTool: Tool<ListScanResourcesInputShape, ListScanResourcesOutput> = {
  name: "list_scan_resources",
  description:
    "List the sub-resources a scan captured on one surface — URL, type, content type, size, and `skipped` when the body was not kept — so you can pick one to read with `get_scan_resource_body` by its `index`. Use it to find a network's pop script, a redirector or a kit stage the screenshots cannot show. " +
    CAPTURED_CONTENTS_DOC,
  annotations: {
    title: "List Scan Resources",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListScanResourcesInputShape),
  handler: async (input, ctx): Promise<Result<ListScanResourcesOutput, ToolError>> => {
    const surface = toResourceSurface(input);
    if (surface.isErr()) return err(surface.error);
    const result = await ctx.api.listScanResources(input.scan_id, surface.value);
    if (result.isErr()) return err(mapApiError(result.error));
    const rows = result.value.filter((row) =>
      matches(row, input.resource_type, input.url_contains)
    );
    const start = (input.page - 1) * input.limit;
    return ok({
      items: rows.slice(start, start + input.limit),
      total: rows.length,
      page: input.page,
      limit: input.limit,
    });
  },
};
