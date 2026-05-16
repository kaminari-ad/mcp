/**
 * Tool: `list_run_scans` — paginated brief-scan list for ONE run.
 */

import { z } from "zod";

import type { PaginatedResponse, ScanBriefResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListRunScansInputShape = {
  run_id: z.string().uuid().describe("Run UUID."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListRunScansInputShape = typeof ListRunScansInputShape;

export type ListRunScansOutput = PaginatedResponse<ScanBriefResponse>;

export const listRunScansTool: Tool<ListRunScansInputShape, ListRunScansOutput> = {
  name: "list_run_scans",
  description: "List the brief-scan items produced by one run (status, country, URL, timestamps).",
  annotations: {
    title: "List Run Scans",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListRunScansInputShape),
  handler: async (input, ctx): Promise<Result<ListRunScansOutput, ToolError>> => {
    const result = await ctx.api.listRunScans(input.run_id, {
      page: input.page,
      limit: input.limit,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
