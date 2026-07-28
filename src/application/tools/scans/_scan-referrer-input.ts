/**
 * Shared zod field for the scan `referrer`.
 *
 * `create_scan` and `create_bulk_scans` both accept the same optional
 * page URL. Defining it once keeps the two tools' agent-facing
 * descriptions identical — the field means different things per check
 * mode, so a drifting description would make the model send the wrong
 * URL.
 *
 * The scheme and length bounds mirror the API (`AnyHttpUrl` against a
 * `varchar(2048)` column): `z.string().url()` alone accepts
 * `javascript:`, `file:` and `data:` URLs the API answers with a 422.
 * Both bounds land in the JSON Schema the model reads (`pattern`,
 * `maxLength`), which a `.refine()` would not.
 */
import { z } from "zod";

export const scanReferrerField = z
  .string()
  .url()
  .regex(/^https?:\/\//i, "Must be an http(s) URL.")
  .max(2048)
  .optional()
  .describe(
    "Optional http(s) page URL the check is performed from. With `ad_tag` or " +
      "`vast_tag` this is the publisher page the tag is embedded in — NOT the " +
      "creative and NOT its landing page; the browser commits the page document " +
      "on this URL without fetching the publisher, so the creative renders as if " +
      "embedded there, and its cross-origin subrequests receive the origin only " +
      "(https://publisher.example/, no path). With a `url` target this is " +
      "where the visitor came from, sent in full as the Referer of the page request."
  );
