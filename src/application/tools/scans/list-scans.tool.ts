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
      "Comma-separated statuses to filter by. Lifecycle values: pending, running, crawled, checking, checking_async, rechecking, completed, partial, failed, cancelled."
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
  parent_scan_id: z
    .string()
    .uuid()
    .optional()
    .describe(
      "Filter to the ad-discovery child scans of one parent scan. Setting this lifts the default 7-day window, so old children stay reachable. `list_scan_children` is the paginated equivalent."
    ),
  tag: z.string().optional().describe("Comma-separated tag slugs to filter by."),
  tag_match: z
    .enum(["any", "all"])
    .optional()
    .describe(
      "How multiple `tag` slugs combine: `any` (default) returns scans carrying at least one, `all` requires every one of them."
    ),
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
    .record(
      z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9_]+$/, "label keys must be snake_case ([a-z0-9_]+)"),
      z.string().min(1).max(200)
    )
    .optional()
    .describe(
      "Dynamic label filters as a flat object: { brand_safety: 'high', vertical: 'gambling' }. Keys are snake_case and must exist in the org's label catalogue. Each key becomes a `label_<key>=<value>` query param. See `list_account_labels`."
    ),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page number."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size (1-200). Default 50."),
} as const;
type ListScansInputShape = typeof ListScansInputShape;

export type ListScansOutput = PaginatedResponse<ScanBriefResponse>;

export const listScansTool: Tool<ListScansInputShape, ListScansOutput> = {
  name: "list_scans",
  description:
    "List scans for the caller's organization with optional filters (status, country, URL substring, date range, run/campaign/group, tag, AI/IAB/brand category, dynamic labels). Returns a paginated envelope; each brief carries `is_ad_tag` and `is_vast` flags, an absolute screenshot URL plus report_url (auth dashboard) and public_report_url (shareable) deep-links — link users with those, never hand-build URLs. Repeated scans look like near-duplicate rows: `repeat_index` / `repeat_total` place each one inside its repeat group (0-based) and a non-null `repeat_session_id` means the group ran in `shared` mode (one browser, one IP, cookies carried across repeats) — group by it to compare the repeats of one combination. `retry_attempt` / `retry_max_attempts` count technical re-crawls of that same scan, not extra scans. `repeat_scan_ids` is not part of this response; use `get_scan` for a single scan's full detail.",
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
      ...(input.parent_scan_id !== undefined ? { parent_scan_id: input.parent_scan_id } : {}),
      ...(input.tag !== undefined ? { tag: input.tag } : {}),
      ...(input.tag_match !== undefined ? { tag_match: input.tag_match } : {}),
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
