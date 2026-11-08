/**
 * Tool: `get_scan_resource_body` — one captured sub-resource's contents, in
 * chunks, so a 1 MB bundle is read in a handful of calls.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import {
  CAPTURED_CONTENTS_DOC,
  resourceSurfaceInputShape,
  toResourceSurface,
} from "./_resource-surface-input.js";

const GetScanResourceBodyInputShape = {
  ...resourceSurfaceInputShape,
  index: z
    .number()
    .int()
    .min(0)
    .describe("The resource's `index` from `list_scan_resources` for the same surface."),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("First character to return; pass the previous call's `next_offset` to continue."),
  length: z
    .number()
    .int()
    .min(1)
    .max(100_000)
    .default(50_000)
    .describe("Characters to return (1-100000). Default 50000."),
} as const;
type GetScanResourceBodyInputShape = typeof GetScanResourceBodyInputShape;

export interface GetScanResourceBodyOutput {
  readonly scan_id: string;
  readonly index: number;
  readonly url: string;
  readonly resource_type: string;
  readonly content_type: string;
  readonly size: number;
  readonly skipped: string | null;
  readonly total_length: number;
  readonly offset: number;
  readonly length: number;
  readonly next_offset: number | null;
  readonly body: string;
}

export const getScanResourceBodyTool: Tool<
  GetScanResourceBodyInputShape,
  GetScanResourceBodyOutput
> = {
  name: "get_scan_resource_body",
  description:
    "Read the contents of one sub-resource a scan captured, by its `index` from `list_scan_resources`, a chunk at a time: `total_length` is the full length in characters and `next_offset` is where the next chunk starts (`null` once you have it all). A row with `skipped` has no body. " +
    CAPTURED_CONTENTS_DOC,
  annotations: {
    title: "Get Scan Resource Body",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetScanResourceBodyInputShape),
  handler: async (input, ctx): Promise<Result<GetScanResourceBodyOutput, ToolError>> => {
    const surface = toResourceSurface(input);
    if (surface.isErr()) return err(surface.error);
    const result = await ctx.api.getScanResourceBody(input.scan_id, surface.value, input.index);
    if (result.isErr()) return err(mapApiError(result.error));
    const row = result.value;
    if (row === null) {
      return err({
        kind: "not-found",
        message: `No resource ${String(input.index)} on this surface — take indexes from \`list_scan_resources\`.`,
      });
    }
    const full = row.body ?? "";
    const chunk = full.slice(input.offset, input.offset + input.length);
    const end = input.offset + chunk.length;
    return ok({
      scan_id: input.scan_id,
      index: row.index,
      url: row.url,
      resource_type: row.resource_type,
      content_type: row.content_type,
      size: row.size,
      skipped: row.skipped,
      total_length: full.length,
      offset: input.offset,
      length: chunk.length,
      next_offset: end < full.length ? end : null,
      body: chunk,
    });
  },
};
