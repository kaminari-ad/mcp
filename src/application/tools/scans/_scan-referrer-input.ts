/**
 * Shared zod field for the scan `referrer`.
 *
 * `create_scan` and `create_bulk_scans` both accept the same optional
 * page URL. Defining it once keeps the two tools' agent-facing
 * descriptions identical — the field means different things per check
 * mode, so a drifting description would make the model send the wrong
 * URL.
 */
import { z } from "zod";

export const scanReferrerField = z
  .string()
  .url()
  .optional()
  .describe(
    "Optional http(s) page URL the check is performed from. With `ad_tag` or " +
      "`vast_tag` this is the publisher page the tag is embedded in — NOT the " +
      "creative and NOT its landing page; the browser commits the page document " +
      "on this URL without fetching the publisher, so the creative renders as if " +
      "embedded there. With `url` or `ad_discovery` this is where the visitor came " +
      "from, sent as the Referer of the page request. Cross-origin subrequests " +
      "receive the origin only (https://publisher.example/, no path)."
  );
