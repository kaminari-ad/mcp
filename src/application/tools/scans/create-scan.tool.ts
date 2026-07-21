/**
 * Tool: `create_scan` — queue a single new scan.
 *
 * Wraps `POST /api/v1/scans`. **Costs credits.** Exactly one of `url`,
 * `ad_tag`, or `vast_tag` is required (enforced by the API).
 */

import { z } from "zod";

import type { ScanResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { scanProxyField } from "./_scan-proxy-input.js";

const CreateScanInputShape = {
  url: z
    .string()
    .url()
    .optional()
    .describe(
      "Direct URL of the ad / landing page. Provide exactly one of `url`, `ad_tag`, or `vast_tag`."
    ),
  ad_tag: z
    .string()
    .optional()
    .describe(
      "Raw HTML/JS ad tag (script, iframe, image) OR an http(s) URL of a page " +
        "with the creative already rendered. Provide exactly one of `url`, `ad_tag`, or `vast_tag`."
    ),
  vast_tag: z
    .string()
    .optional()
    .describe(
      "VAST video ad tag: an http(s) URL of a VAST endpoint OR raw VAST XML (a " +
        "document containing a <VAST> element). Fetched and played in a real " +
        "browser. Provide exactly one of `url`, `ad_tag`, or `vast_tag`."
    ),
  country_code: z
    .string()
    .length(2)
    .describe("ISO 3166-1 alpha-2 country code, e.g. US, DE, JP. Determines proxy geo."),
  emulator_id: z
    .string()
    .min(1)
    .max(100)
    .describe("Device/OS profile slug; use `list_emulators` to discover valid values."),
  proxy: scanProxyField,
  labels: z
    .record(z.string())
    .optional()
    .describe("Arbitrary string -> string metadata attached to the scan."),
  campaign_id: z
    .string()
    .uuid()
    .optional()
    .describe("Optional campaign UUID to attribute the scan to."),
  run_id: z.string().uuid().optional().describe("Optional run UUID inside the campaign."),
  ad_discovery: z
    .boolean()
    .optional()
    .describe(
      "Publisher ad discovery: detect ad blocks on the page and spawn one child " +
        "scan per detected ad (banner/pop). Only valid with `url`. Each child is a " +
        "separate billed scan; list them with `list_scan_children`."
    ),
} as const;
type CreateScanInputShape = typeof CreateScanInputShape;

export type CreateScanOutput = ScanResponse;

export const createScanTool: Tool<CreateScanInputShape, CreateScanOutput> = {
  name: "create_scan",
  description:
    "Queue a single new scan for a URL, ad-tag, or VAST video tag against one country. COSTS CREDITS and bills the caller's organization. Returns the newly-created scan record.",
  annotations: {
    title: "Create Scan",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreateScanInputShape),
  handler: async (input, ctx): Promise<Result<CreateScanOutput, ToolError>> => {
    const body = {
      country_code: input.country_code,
      emulator_id: input.emulator_id,
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.ad_tag !== undefined ? { ad_tag: input.ad_tag } : {}),
      ...(input.vast_tag !== undefined ? { vast_tag: input.vast_tag } : {}),
      ...(input.proxy !== undefined ? { proxy: input.proxy } : {}),
      ...(input.labels !== undefined ? { labels: input.labels } : {}),
      ...(input.campaign_id !== undefined ? { campaign_id: input.campaign_id } : {}),
      ...(input.run_id !== undefined ? { run_id: input.run_id } : {}),
      ...(input.ad_discovery !== undefined ? { ad_discovery: input.ad_discovery } : {}),
    };
    const result = await ctx.api.createScan(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
