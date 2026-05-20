/**
 * Tool: `list_scans` — paginated list of scans for the caller's org.
 *
 * Wraps `GET /api/v1/scans`. Filters are pass-through to the API; this
 * file does NOT contain business logic about what filters mean. Default
 * date window (last 7 days) is applied in the API, not here, so the
 * agent sees consistent behaviour whether it sets `date_from` or not.
 */

import { z } from "zod";

import type { PaginatedResponse, ScanBriefResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListScansInputShape = {
  status: z
    .string()
    .optional()
    .describe(
      "Comma-separated statuses to filter by. Lifecycle values: pending, running, crawled, checking, checking_async, completed, partial, failed, cancelled."
    ),
  country_code: z
    .string()
    .optional()
    .describe("Comma-separated ISO 3166-1 alpha-2 country codes, e.g. US,DE,JP."),
  url: z.string().optional().describe("Substring match against the scanned URL."),
  scan_id: z.string().optional().describe("Comma-separated scan UUIDs to fetch a specific set."),
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
  timezone: z
    .string()
    .optional()
    .describe(
      "IANA timezone (e.g. 'Europe/Berlin') applied to date_from / date_to. Defaults to UTC."
    ),
  run_id: z.string().uuid().optional().describe("Filter to scans of one run."),
  campaign_id: z.string().uuid().optional().describe("Filter to scans of one campaign."),
  group_id: z.string().uuid().optional().describe("Filter to scans of one campaign group."),
  tag: z.string().optional().describe("Comma-separated tag slugs to filter by."),
  ai_category: z
    .string()
    .optional()
    .describe(
      "Filter by the freeform LLM-generated category prefix on the scan (slash-separated tier path, e.g. 'Gambling/Online Casinos')."
    ),
  iab_v3_category: z
    .string()
    .optional()
    .describe("Filter by canonical IAB Content Taxonomy V3 prefix (slash-separated tier path)."),
  iab_category: z
    .string()
    .optional()
    .describe("Filter by legacy IAB V2.2 category (only present on pre-P3 scans)."),
  brand: z.string().optional().describe("Filter by detected advertiser brand (case-insensitive)."),
  labels: z
    .record(z.string().min(1).max(100), z.string().min(1).max(200))
    .optional()
    .describe(
      "Dynamic label filters as a flat object: { brand_safety: 'high', vertical: 'gambling' }. Each key becomes a `label_<key>=<value>` query param. See `list_account_labels` for the org's labels."
    ),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size (1-200). Default 50."),
} as const;
type ListScansInputShape = typeof ListScansInputShape;

export type ListScansOutput = PaginatedResponse<ScanBriefResponse>;

export const listScansTool: Tool<ListScansInputShape, ListScansOutput> = {
  name: "list_scans",
  description:
    "List scans for the caller's organization with optional filters (status, country, URL substring, date range, run/campaign/group, tag, AI/IAB/brand category, dynamic labels). Returns a paginated envelope.",
  annotations: {
    title: "List Scans",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListScansInputShape),
  handler: async (input, ctx): Promise<Result<ListScansOutput, ToolError>> => {
    // exactOptionalPropertyTypes: only forward defined fields.
    const labelFilters: Record<`label_${string}`, string> = {};
    if (input.labels !== undefined) {
      for (const [k, v] of Object.entries(input.labels)) {
        labelFilters[`label_${k}`] = v;
      }
    }
    const filters: Parameters<typeof ctx.api.listScans>[0] = {
      page: input.page,
      limit: input.limit,
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.country_code !== undefined ? { country_code: input.country_code } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.scan_id !== undefined ? { scan_id: input.scan_id } : {}),
      ...(input.date_from !== undefined ? { date_from: input.date_from } : {}),
      ...(input.date_to !== undefined ? { date_to: input.date_to } : {}),
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      ...(input.run_id !== undefined ? { run_id: input.run_id } : {}),
      ...(input.campaign_id !== undefined ? { campaign_id: input.campaign_id } : {}),
      ...(input.group_id !== undefined ? { group_id: input.group_id } : {}),
      ...(input.tag !== undefined ? { tag: input.tag } : {}),
      ...(input.ai_category !== undefined ? { ai_category: input.ai_category } : {}),
      ...(input.iab_v3_category !== undefined ? { iab_v3_category: input.iab_v3_category } : {}),
      ...(input.iab_category !== undefined ? { iab_category: input.iab_category } : {}),
      ...(input.brand !== undefined ? { brand: input.brand } : {}),
      ...labelFilters,
    };
    const result = await ctx.api.listScans(filters);
    if (result.isErr()) {
      return err(mapApiError(result.error));
    }
    return ok(result.value);
  },
};
