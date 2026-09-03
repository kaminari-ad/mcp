/**
 * Tool: `get_scan_screenshot` — primary scan screenshot as an MCP image block.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import { type BinaryContentEnvelope, imageBlock } from "../_shared/binary-content.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetScanScreenshotInputShape = {
  scan_id: z.string().uuid().describe("Scan UUID."),
  width: z
    .number()
    .int()
    .min(50)
    .max(2000)
    .optional()
    .describe(
      "Optional resize width in pixels. The API resizes server-side to keep the image small for the agent's context window. It also top-crops a resized page screenshot whose height exceeds 2.5x its width, so a long page comes back as its top region only — never conclude that something is absent from the page from a resized capture. Fetch without `width` when you need the whole page."
    ),
} as const;
type GetScanScreenshotInputShape = typeof GetScanScreenshotInputShape;

export type GetScanScreenshotOutput = BinaryContentEnvelope;

export const getScanScreenshotTool: Tool<GetScanScreenshotInputShape, GetScanScreenshotOutput> = {
  name: "get_scan_screenshot",
  description:
    "Fetch the primary screenshot for a scan as an inline image (base64-encoded WebP — the API stores and serves every screenshot as WebP, so the client must be able to decode it). Pass `width` to request a resized version (50-2000 px). Returns one MCP image content block.",
  annotations: {
    title: "Get Scan Screenshot",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetScanScreenshotInputShape),
  handler: async (input, ctx): Promise<Result<GetScanScreenshotOutput, ToolError>> => {
    const result = await ctx.api.getScanScreenshot(input.scan_id, input.width);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(imageBlock(result.value.bytes, result.value.contentType));
  },
};
