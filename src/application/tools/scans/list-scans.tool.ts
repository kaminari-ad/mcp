/**
 * Tool: `list_scans` — paginated list of scans for the caller's org.
 *
 * Wraps `GET /api/v1/scans`. Filters are pass-through to the API; this
 * file does NOT contain business logic about what filters mean. Default
 * date window (last 7 days) is applied in the API, not here, so the
 * agent sees consistent behaviour whether it sets `date_from` or not.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { PaginatedResponse, ScanBriefResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListScansInputShape = {
  status: z
    .string()
    .optional()
    .describe(
      "Comma-separated statuses to filter by. One of: pending, running, done, failed, cancelled."
    ),
  country_code: z
    .string()
    .optional()
    .describe("Comma-separated ISO 3166-1 alpha-2 country codes, e.g. US,DE,JP."),
  url: z
    .string()
    .optional()
    .describe("Substring match against the scanned URL."),
  scan_id: z
    .string()
    .optional()
    .describe("Comma-separated scan UUIDs to fetch a specific set."),
  date_from: z
    .string()
    .date()
    .optional()
    .describe("ISO date (YYYY-MM-DD), inclusive lower bound on scan creation."),
  date_to: z
    .string()
    .date()
    .optional()
    .describe("ISO date (YYYY-MM-DD), inclusive upper bound on scan creation."),
  tag: z
    .string()
    .optional()
    .describe("Comma-separated tag slugs to filter by."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .default(50)
    .describe("Page size (1-200). Default 50."),
} as const;
type ListScansInputShape = typeof ListScansInputShape;

export type ListScansOutput = PaginatedResponse<ScanBriefResponse>;

export const listScansTool: Tool<ListScansInputShape, ListScansOutput> = {
  name: "list_scans",
  description:
        "List scans for the caller's organization with optional filters (status, country, URL substring, date range, tags). Returns a paginated envelope.",
      annotations: { title: "List Scans", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(ListScansInputShape),
  handler: async (input, ctx): Promise<Result<ListScansOutput, ToolError>> => {
    // exactOptionalPropertyTypes: only forward defined fields.
    const filters: Parameters<typeof ctx.api.listScans>[0] = {
      page: input.page,
      limit: input.limit,
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.country_code !== undefined ? { country_code: input.country_code } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.scan_id !== undefined ? { scan_id: input.scan_id } : {}),
      ...(input.date_from !== undefined ? { date_from: input.date_from } : {}),
      ...(input.date_to !== undefined ? { date_to: input.date_to } : {}),
      ...(input.tag !== undefined ? { tag: input.tag } : {}),
    };
    const result = await ctx.api.listScans(filters);
    if (result.isErr()) {
      return err(mapApiError(result.error));
    }
    return ok(result.value);
  },
};
