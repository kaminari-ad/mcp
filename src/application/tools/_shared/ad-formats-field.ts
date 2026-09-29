/**
 * Shared zod field for the ad-discovery format selection.
 *
 * `create_scan`, `create_campaign` and `update_campaign` all accept the same
 * optional `ad_formats`. Defining it once keeps the agent-facing `.describe()`
 * text — the only place an LLM learns that a left-out format is neither
 * captured nor billed, and that the field is refused outside ad discovery —
 * identical across the three surfaces.
 *
 * The vocabulary is closed on the request side (the API 422s anything else)
 * but read back as plain strings: see `AdFormatsResponse` in the port.
 */
import { z } from "zod";

const AD_FORMATS_DESCRIPTION =
  "Which ad formats an ad-discovery run checks: any of `banner`, `video` and `pop` " +
  "(`pop` covers pop-unders and tab-unders). A format left out is neither captured " +
  "nor billed — `['pop']` checks the page's pops without screenshotting or clicking " +
  "a single banner. A tab-under the page forces on its own is still reported as a " +
  "pop. Only valid on an ad-discovery target — `ad_discovery: true` on a scan, or " +
  '`campaign_type: "ad_discovery"` on a campaign — and rejected with 422 anywhere ' +
  "else, as is an empty list.";

const adFormats = z.array(z.enum(["banner", "video", "pop"])).min(1);

export const adFormatsField = adFormats
  .optional()
  .describe(`${AD_FORMATS_DESCRIPTION} Omit it to check every format.`);

export const adFormatsUpdateField = adFormats
  .nullable()
  .optional()
  .describe(
    `${AD_FORMATS_DESCRIPTION} Omitting the field leaves the campaign's current ` +
      "selection unchanged; pass null to go back to checking every format."
  );
