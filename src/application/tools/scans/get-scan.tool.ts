/**
 * Tool: `get_scan` — full detail for one scan by UUID.
 *
 * Wraps `GET /api/v1/scans/{id}`. Returns the most-used fields; nested
 * arrays (`redirect_chain`, `landings`) are omitted on purpose — they
 * are large and usually overkill for an agent answer. Add follow-up
 * tools later if needed.
 */

import { z } from "zod";

import type { ScanResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetScanInputShape = {
  scan_id: z
    .string()
    .uuid()
    .describe("The scan's UUID (returned by `list_scans` or `create_scan`)."),
} as const;
type GetScanInputShape = typeof GetScanInputShape;

export type GetScanOutput = ScanResponse;

export const getScanTool: Tool<GetScanInputShape, GetScanOutput> = {
  name: "get_scan",
  description:
    "Get full detail for one scan by UUID: status, offer URL, absolute screenshot URL, report_url + public_report_url deep-links, timing, labels, and the parent campaign if any. VAST video scans also carry `vast_tag`, `creative_kind` (`banner` or `video` today; treat it as an open string), and a `video` block (duration, media-file URL, the creative's `click_through` destination, VAST version, ad system, VPAID flag, wrapper depth). Repeats and retries: `repeat_index` / `repeat_total` place this scan inside its repeat group (0-based, so 2 of 5 reads as repeat_index 1), a non-null `repeat_session_id` means the group ran in `shared` mode (same browser, same IP, cookies carried over) and is the key to correlate its members — a shared group of one has nothing to carry over, so it stays null — `repeat_scan_ids` is filled only on the create response, and `retry_attempt` / `retry_max_attempts` show how many technical re-crawls this scan already consumed. Link users with the returned `report_url` / `public_report_url` — never construct URLs yourself.",
  annotations: {
    title: "Get Scan",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetScanInputShape),
  handler: async (input, ctx): Promise<Result<GetScanOutput, ToolError>> => {
    const result = await ctx.api.getScan(input.scan_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
