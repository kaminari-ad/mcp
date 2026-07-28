/**
 * Shared zod fields for the campaign `referrer`.
 *
 * `create_campaign` and `update_campaign` expose the same optional page
 * URL, inherited by every scan the campaign queues. Defining it once
 * keeps the two tools' agent-facing descriptions identical — the field
 * means different things per campaign type, so a drifting description
 * would make the model send the wrong URL. The update variant adds
 * `null` (clears the stored value); on create `null` would mean nothing.
 *
 * The scheme and length bounds mirror the API (`AnyHttpUrl` against a
 * `varchar(2048)` column): `z.string().url()` alone accepts
 * `javascript:`, `file:` and `data:` URLs the API answers with a 422.
 * Both bounds land in the JSON Schema the model reads (`pattern`,
 * `maxLength`), which a `.refine()` would not.
 */
import { z } from "zod";

const campaignReferrerUrl = z
  .string()
  .url()
  .regex(/^https?:\/\//i, "Must be an http(s) URL.")
  .max(2048);

const CAMPAIGN_REFERRER_DESCRIPTION =
  "Optional http(s) page URL every scan of this campaign is checked from. For " +
  "`ad_tag` and `vast` campaigns this is the publisher page the tag is embedded " +
  "in — NOT the creative and NOT its landing page; the browser commits the page " +
  "document on this URL without fetching the publisher, so the creative renders " +
  "as if embedded there, and its cross-origin subrequests receive the origin only " +
  "(https://publisher.example/, no path). For `url` and `ad_discovery` campaigns " +
  "this is where the visitor came from, sent in full as the Referer of the page " +
  "request.";

export const campaignReferrerField = campaignReferrerUrl
  .optional()
  .describe(CAMPAIGN_REFERRER_DESCRIPTION);

export const campaignReferrerUpdateField = campaignReferrerUrl
  .nullable()
  .optional()
  .describe(`${CAMPAIGN_REFERRER_DESCRIPTION} Pass null to clear it.`);
