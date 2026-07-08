/**
 * Tool: `create_bulk_scans` — queue one scan per country in a single call.
 *
 * Wraps `POST /api/v1/scans/bulk`. **Costs N credits** where N is the
 * number of countries. Either `url` or `ad_tag` is required (XOR).
 */

import { z } from "zod";

import type { ScanResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { scanProxyField } from "./_scan-proxy-input.js";

const CreateBulkScansInputShape = {
  url: z.string().url().optional().describe("Direct URL. EITHER `url` OR `ad_tag` is required."),
  ad_tag: z
    .string()
    .optional()
    .describe(
      "Raw ad-tag HTML/JS OR an http(s) URL of a page with the creative " +
        "already rendered. EITHER `url` OR `ad_tag` is required."
    ),
  country_codes: z
    .array(z.string().length(2))
    .min(1)
    .max(50)
    .describe("List of ISO 3166-1 alpha-2 country codes; one scan per country is created."),
  emulator_id: z
    .string()
    .min(1)
    .max(100)
    .describe("Device/OS profile slug; same for every country in the batch."),
  proxy: scanProxyField,
  labels: z
    .record(z.string())
    .optional()
    .describe("Arbitrary metadata copied onto every created scan."),
} as const;
type CreateBulkScansInputShape = typeof CreateBulkScansInputShape;

export interface CreateBulkScansOutput {
  readonly items: readonly ScanResponse[];
  readonly total: number;
}

export const createBulkScansTool: Tool<CreateBulkScansInputShape, CreateBulkScansOutput> = {
  name: "create_bulk_scans",
  description:
    "Queue one new scan per country in a single call (e.g. test the same URL from US + DE + JP). COSTS N CREDITS where N = number of countries. Returns the list of created scans.",
  annotations: {
    title: "Create Bulk Scans",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreateBulkScansInputShape),
  handler: async (input, ctx): Promise<Result<CreateBulkScansOutput, ToolError>> => {
    const body = {
      country_codes: input.country_codes,
      emulator_id: input.emulator_id,
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.ad_tag !== undefined ? { ad_tag: input.ad_tag } : {}),
      ...(input.proxy !== undefined ? { proxy: input.proxy } : {}),
      ...(input.labels !== undefined ? { labels: input.labels } : {}),
    };
    const result = await ctx.api.createBulkScans(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
