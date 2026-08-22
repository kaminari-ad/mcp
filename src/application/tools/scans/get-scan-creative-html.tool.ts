/**
 * Tool: `get_scan_creative_html` — the generated creative markup for an
 * ad-tag scan, as readable text.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import { decodeUtf8, formatBytes, MAX_TEXT_ARTIFACT_BYTES } from "../_shared/text-artifact.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetScanCreativeHtmlInputShape = {
  scan_id: z.string().uuid().describe("Scan UUID."),
} as const;
type GetScanCreativeHtmlInputShape = typeof GetScanCreativeHtmlInputShape;

export interface GetScanCreativeHtmlOutput {
  readonly scan_id: string;
  readonly content_type: string;
  readonly byte_size: number;
  readonly html: string;
}

export const getScanCreativeHtmlTool: Tool<
  GetScanCreativeHtmlInputShape,
  GetScanCreativeHtmlOutput
> = {
  name: "get_scan_creative_html",
  description:
    "Fetch the generated creative markup for an ad-tag scan as text — the HTML the ad tag produced, with the scripts, iframes and click-through URLs it embedded. Use it to explain WHY a creative was tagged when a screenshot cannot show it (obfuscated redirectors, hidden trackers, injected handlers). Only ad-tag scans have this artifact; a URL or VAST scan returns not-found. The markup is returned inert as text and is never executed.",
  annotations: {
    title: "Get Scan Creative HTML",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetScanCreativeHtmlInputShape),
  handler: async (input, ctx): Promise<Result<GetScanCreativeHtmlOutput, ToolError>> => {
    const result = await ctx.api.getScanCreativeHtml(input.scan_id);
    if (result.isErr()) return err(mapApiError(result.error));
    const { bytes, contentType } = result.value;
    if (bytes.byteLength > MAX_TEXT_ARTIFACT_BYTES) {
      return err({
        kind: "invalid-input",
        message: `Creative HTML is ${formatBytes(bytes.byteLength)}, over the ${formatBytes(MAX_TEXT_ARTIFACT_BYTES)} tool limit. Open the scan report from \`get_scan\` to inspect it instead.`,
      });
    }
    return ok({
      scan_id: input.scan_id,
      content_type: contentType,
      byte_size: bytes.byteLength,
      html: decodeUtf8(bytes),
    });
  },
};
