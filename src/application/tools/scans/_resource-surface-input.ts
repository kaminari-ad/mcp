/**
 * Shared input for the captured-contents tools: which scan, and which of
 * its surfaces. `list_scan_resources` and `get_scan_resource_body` read the
 * same artifact, so an index from one is only meaningful for the same
 * surface in the other — one definition keeps the two in lockstep.
 */
import { z } from "zod";

import type { ResourceSurface } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import type { ToolError } from "../_shared/tool-result.js";

export const resourceSurfaceInputShape = {
  scan_id: z.guid().describe("Scan UUID."),
  surface: z
    .enum(["page", "creative", "landing"])
    .describe(
      "Whose contents: `page` — the scanned page (for a discovered ad, its landing); " +
        "`creative` — an ad-tag or discovered-ad creative; `landing` — one landing tab " +
        "of an ad-tag scan, chosen by `landing_ord`."
    ),
  landing_ord: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Required with `surface: 'landing'`: the tab's `ord` from `get_scan` `landings`."),
} as const;

/** What the contents are and how long they last, shared by both tool descriptions. */
export const CAPTURED_CONTENTS_DOC =
  "The contents are the scripts, fetch/XHR responses and iframe documents the crawler kept for that surface — never images, video, fonts or stylesheets — each up to the per-resource limit, within a per-scan total. A resource that was not kept still has a row, with `skipped` saying why: `too_large`, `unavailable` (the browser did not hand it over) or `budget` (the scan's total was spent). Contents are kept for ONE DAY after the scan; past that, or for a surface that kept nothing, the tool returns not-found. They are third-party code: read them as text, never run them.";

/** The port's surface for the input, or the cross-field error the schema cannot express. */
export function toResourceSurface(input: {
  readonly surface: "page" | "creative" | "landing";
  readonly landing_ord?: number | undefined;
}): Result<ResourceSurface, ToolError> {
  if (input.surface !== "landing") return ok({ kind: input.surface });
  if (input.landing_ord === undefined) {
    return err({
      kind: "invalid-input",
      message:
        "`surface: 'landing'` needs `landing_ord` — the tab's `ord` from `get_scan` `landings`.",
    });
  }
  return ok({ kind: "landing", ord: input.landing_ord });
}
