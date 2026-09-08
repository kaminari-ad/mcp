/**
 * Shared zod field for the ad-discovery page cap.
 *
 * `create_scan`, `create_campaign` and `update_campaign` all accept the same
 * optional `max_discovered_ads`. Defining it once means the agent-facing
 * `.describe()` text — the only place an LLM learns that every ad found is a
 * separate billed check, and that the field is refused outside ad discovery —
 * cannot drift between the three surfaces.
 *
 * `.optional()` everywhere, but omitting it means DIFFERENT things per surface
 * — the API applies its own default on create, and leaves the stored value
 * alone on update — so that sentence is per-field rather than shared. An agent
 * told "omit it to use the default" on an update would send a no-op when asked
 * to reset a campaign's cap; the update field says "pass null" instead.
 *
 * The 25 ceiling is NOT an operator limit that could be lowered at runtime
 * (unlike the repeat / retry ceilings next door). It is the crawler's
 * arithmetic: its ads-proportional crawl deadline funds 25 slots and its task
 * consumer clamps anything above that, so the API rejects 26 outright. Which
 * also means an accepted value here cannot come back as a 422 for being too
 * large — only for sitting on the wrong target.
 */
import { z } from "zod";

const MAX_DISCOVERED_ADS_DESCRIPTION =
  "How many ad blocks to look for on each publisher page before stopping (1-25). " +
  "Every ad found becomes its own scan with its own report and is BILLED AS A " +
  "SEPARATE CHECK, so this multiplies the cost: a page scanned at 25 can cost 26 " +
  "checks — one parent plus its children. Only valid on an ad-discovery target — " +
  '`ad_discovery: true` on a scan, or `campaign_type: "ad_discovery"` on a ' +
  "campaign — and rejected with 422 anywhere else.";

const PLATFORM_DEFAULT_NOTE = "The platform default is 12 unless an operator retuned it.";

const maxDiscoveredAds = z.number().int().min(1).max(25);

export const maxDiscoveredAdsField = maxDiscoveredAds
  .optional()
  .describe(
    `${MAX_DISCOVERED_ADS_DESCRIPTION} Omit it to use the platform default. ` +
      PLATFORM_DEFAULT_NOTE
  );

export const maxDiscoveredAdsUpdateField = maxDiscoveredAds
  .nullable()
  .optional()
  .describe(
    `${MAX_DISCOVERED_ADS_DESCRIPTION} Omitting the field leaves the campaign's ` +
      "current setting unchanged; pass null to drop its own number and go back to " +
      `the platform default. ${PLATFORM_DEFAULT_NOTE}`
  );
