/**
 * Tool: `get_scan_vast_xml` — the resolved VAST document for a VAST
 * scan, as readable text.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import { decodeUtf8, formatBytes, MAX_TEXT_ARTIFACT_BYTES } from "../_shared/text-artifact.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetScanVastXmlInputShape = {
  scan_id: z.string().uuid().describe("Scan UUID."),
} as const;
type GetScanVastXmlInputShape = typeof GetScanVastXmlInputShape;

export interface GetScanVastXmlOutput {
  readonly scan_id: string;
  readonly content_type: string;
  readonly byte_size: number;
  readonly xml: string;
}

export const getScanVastXmlTool: Tool<GetScanVastXmlInputShape, GetScanVastXmlOutput> = {
  name: "get_scan_vast_xml",
  description:
    "Fetch the VAST document for a VAST scan as text, with wrappers already resolved so the whole chain is visible in one payload. Use it to inspect the tracking pixels, verification vendors, companion ads and click-through targets a video ad declared — the parsed summary on `get_scan` (`video` block) covers duration, media file and ad system, but not the full element tree. Only VAST scans have this artifact; others return not-found.",
  annotations: {
    title: "Get Scan VAST XML",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetScanVastXmlInputShape),
  handler: async (input, ctx): Promise<Result<GetScanVastXmlOutput, ToolError>> => {
    const result = await ctx.api.getScanVastXml(input.scan_id);
    if (result.isErr()) return err(mapApiError(result.error));
    const { bytes, contentType } = result.value;
    if (bytes.byteLength > MAX_TEXT_ARTIFACT_BYTES) {
      return err({
        kind: "invalid-input",
        message: `VAST XML is ${formatBytes(bytes.byteLength)}, over the ${formatBytes(MAX_TEXT_ARTIFACT_BYTES)} tool limit. Open the scan report from \`get_scan\` to inspect it instead.`,
      });
    }
    return ok({
      scan_id: input.scan_id,
      content_type: contentType,
      byte_size: bytes.byteLength,
      xml: decodeUtf8(bytes),
    });
  },
};
