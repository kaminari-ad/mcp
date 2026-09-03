/**
 * Tool: `get_scan_creative_screenshot` — ad-tag creative screenshot.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import { type BinaryContentEnvelope, imageBlock } from "../_shared/binary-content.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetScanCreativeScreenshotInputShape = {
  scan_id: z.string().uuid().describe("Scan UUID — must be an ad-tag scan (is_ad_tag=true)."),
  width: z.number().int().min(50).max(2000).optional().describe("Optional resize width in pixels."),
} as const;
type GetScanCreativeScreenshotInputShape = typeof GetScanCreativeScreenshotInputShape;

export type GetScanCreativeScreenshotOutput = BinaryContentEnvelope;

export const getScanCreativeScreenshotTool: Tool<
  GetScanCreativeScreenshotInputShape,
  GetScanCreativeScreenshotOutput
> = {
  name: "get_scan_creative_screenshot",
  description:
    "Fetch the creative screenshot for an ad-tag scan as an inline image (base64-encoded WebP — the API stores and serves every screenshot as WebP, so the client must be able to decode it). Returns 404 if the scan is not an ad-tag scan or has no creative captured yet.",
  annotations: {
    title: "Get Scan Creative Screenshot",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetScanCreativeScreenshotInputShape),
  handler: async (input, ctx): Promise<Result<GetScanCreativeScreenshotOutput, ToolError>> => {
    const result = await ctx.api.getScanCreativeScreenshot(input.scan_id, input.width);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(imageBlock(result.value.bytes, result.value.contentType));
  },
};
