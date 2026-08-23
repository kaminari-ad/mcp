/**
 * Tool: `get_scan_creative_video` — the stored MP4 MediaFile for a VAST
 * scan, as an MCP resource block.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import { type BinaryContentEnvelope, resourceBlock } from "../_shared/binary-content.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetScanCreativeVideoInputShape = {
  scan_id: z.string().uuid().describe("Scan UUID."),
} as const;
type GetScanCreativeVideoInputShape = typeof GetScanCreativeVideoInputShape;

export type GetScanCreativeVideoOutput = BinaryContentEnvelope;

export const getScanCreativeVideoTool: Tool<
  GetScanCreativeVideoInputShape,
  GetScanCreativeVideoOutput
> = {
  name: "get_scan_creative_video",
  description:
    "Fetch the MP4 MediaFile a VAST scan downloaded, as one inline resource block. Only VAST scans have it; others return not-found. Prefer `get_scan_creative_screenshot` for a still frame and `get_scan_vast_xml` for the declared metadata — both are far cheaper. Reach for the video itself only when the moving image is the evidence. Files over 8 MiB are refused rather than inlined — use the still frame for those.",
  annotations: {
    title: "Get Scan Creative Video",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetScanCreativeVideoInputShape),
  handler: async (input, ctx): Promise<Result<GetScanCreativeVideoOutput, ToolError>> => {
    const result = await ctx.api.getScanCreativeVideo(input.scan_id);
    if (result.isErr()) return err(mapApiError(result.error));
    const { bytes, contentType } = result.value;
    return ok(resourceBlock(bytes, contentType, `/api/v1/scans/${input.scan_id}/creative-video`));
  },
};
