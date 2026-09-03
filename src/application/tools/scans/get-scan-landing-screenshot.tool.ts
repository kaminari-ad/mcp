/**
 * Tool: `get_scan_landing_screenshot` — one landing-tab screenshot.
 *
 * Ad-tag scans capture the creative + every landing the ad navigates
 * to. ``landing_ord`` is the 0-indexed slot — see
 * ``ScanResponse.landings[*].ord`` from ``get_scan``.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import { type BinaryContentEnvelope, imageBlock } from "../_shared/binary-content.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetScanLandingScreenshotInputShape = {
  scan_id: z.string().uuid().describe("Scan UUID (ad-tag scan)."),
  landing_ord: z
    .number()
    .int()
    .min(0)
    .max(50)
    .describe("0-indexed landing slot (see `get_scan(...).landings[*].ord`)."),
  width: z
    .number()
    .int()
    .min(50)
    .max(2000)
    .optional()
    .describe(
      "Optional resize width in pixels. The API top-crops a resized landing screenshot whose height exceeds 2.5x its width, so a long landing page comes back as its top region only — never conclude that something is absent from the page from a resized capture. Fetch without `width` when you need the whole page."
    ),
} as const;
type GetScanLandingScreenshotInputShape = typeof GetScanLandingScreenshotInputShape;

export type GetScanLandingScreenshotOutput = BinaryContentEnvelope;

export const getScanLandingScreenshotTool: Tool<
  GetScanLandingScreenshotInputShape,
  GetScanLandingScreenshotOutput
> = {
  name: "get_scan_landing_screenshot",
  description:
    "Fetch the screenshot of one landing tab on an ad-tag scan as an inline image (base64-encoded WebP — the API stores and serves every screenshot as WebP, so the client must be able to decode it). Use `get_scan` first to discover available `landings[*].ord` values.",
  annotations: {
    title: "Get Scan Landing Screenshot",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetScanLandingScreenshotInputShape),
  handler: async (input, ctx): Promise<Result<GetScanLandingScreenshotOutput, ToolError>> => {
    const result = await ctx.api.getScanLandingScreenshot(
      input.scan_id,
      input.landing_ord,
      input.width
    );
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(imageBlock(result.value.bytes, result.value.contentType));
  },
};
