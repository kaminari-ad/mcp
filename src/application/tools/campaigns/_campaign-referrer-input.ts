/**
 * Shared zod field for the campaign `referrer`.
 *
 * `create_campaign` and `update_campaign` expose the same optional page
 * URL, inherited by every scan the campaign queues. Defining it once
 * keeps the two tools' agent-facing descriptions identical — the field
 * means different things per campaign type, so a drifting description
 * would make the model send the wrong URL.
 */
import { z } from "zod";

export const campaignReferrerField = z
  .string()
  .url()
  .optional()
  .describe(
    "Optional http(s) page URL every scan of this campaign is checked from. For " +
      "`ad_tag` and `vast` campaigns this is the publisher page the tag is embedded " +
      "in — NOT the creative and NOT its landing page; the browser commits the page " +
      "document on this URL without fetching the publisher, so the creative renders " +
      "as if embedded there. For `url` and `ad_discovery` campaigns this is where " +
      "the visitor came from, sent as the Referer of the page request. Cross-origin " +
      "subrequests receive the origin only (https://publisher.example/, no path)."
  );
