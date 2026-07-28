/**
 * Shared zod fields + body-builder for the repeat / retry settings.
 *
 * `create_scan`, `create_bulk_scans`, `create_campaign` and
 * `update_campaign` all accept the same three flat fields (names match
 * the API request DTOs). Defining them once means the agent-facing
 * `.describe()` text — the only place an LLM learns that repeats
 * multiply the bill and that `shared` is refused together with ad
 * discovery — cannot drift between the four surfaces.
 *
 * Every field is `.optional()`: on create the API applies its own
 * defaults (`repeat_count: 1`, `repeat_mode: "isolated"`,
 * `retry_max_attempts: 0`); on update an omitted field is left
 * unchanged.
 *
 * The 20 / 5 ceilings mirror the API's *default* operator limits
 * (`SCANNING__MAX_REPEAT_COUNT` / `SCANNING__MAX_RETRY_ATTEMPTS`), so a
 * runaway agent is stopped here instead of by a 422. They are kill
 * switches an operator can lower at any time, so the describe text also
 * warns that an accepted value can still 422 — otherwise the agent has
 * no way to explain that failure.
 *
 * The text stays dimension-free on purpose: `repeat_count` multiplies
 * whatever fan-out the calling tool already produces (nothing for
 * `create_scan`, countries for `create_bulk_scans`, countries x device
 * profiles for the campaign tools), so the concrete formula belongs in
 * each tool's own `description`, not here.
 */
import { z } from "zod";

/**
 * The shared raw zod shape spread into every tool that creates scans
 * (directly or through a campaign).
 */
export const repeatRetryFields = {
  repeat_count: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe(
      "How many times to repeat every scan this call already produces (1-20). It is a " +
        "multiplier on top of the tool's own fan-out — see that tool's description for " +
        "the exact formula — and each resulting repeat is a full scan with its own " +
        "report and its own billing. 1-20 is the API's default ceiling; an operator can " +
        "lower it during an incident, and then a value accepted here still comes back " +
        "as a 422 from the API. Default: 1."
    ),
  repeat_mode: z
    .enum(["isolated", "shared"])
    .optional()
    .describe(
      "How the repeats of one combination relate to each other. 'isolated' gives every " +
        "repeat a fresh browser and a new IP, so the repeats are statistically " +
        "independent. 'shared' runs all repeats of one combination in a single browser " +
        "behind one IP, carrying cookies and localStorage from one repeat to the next — " +
        "use it to reproduce a cloaker or a frequency cap that only misbehaves on the " +
        "second or third visit. 'shared' is rejected with 422 on an ad-discovery target: " +
        "when creating, that is `ad_discovery: true` on a scan or `campaign_type: " +
        '"ad_discovery"` on a campaign; when updating a campaign, it is a campaign whose ' +
        "existing type is already ad_discovery, since campaign_type itself cannot be " +
        "changed. Default: isolated."
    ),
  retry_max_attempts: z
    .number()
    .int()
    .min(0)
    .max(5)
    .optional()
    .describe(
      "Extra crawl attempts when a scan fails for a technical reason — dead proxy, " +
        "navigation timeout, browser crash (0-5). Permanent failures are never retried. " +
        "The same scan is reused and only a completed scan is billed, so a retry never " +
        "double-charges. 0-5 is the API's default ceiling; an operator can lower it, and " +
        "then a value accepted here still comes back as a 422 from the API. Default: 0."
    ),
} satisfies z.ZodRawShape;

/**
 * The repeat / retry subset of a request body, all optional. Returned by
 * {@link pickRepeatRetryBody} — only keys that were actually supplied
 * are present, so the result is safe to spread into a request body
 * regardless of `exactOptionalPropertyTypes`.
 */
export interface RepeatRetryBody {
  repeat_count?: number;
  repeat_mode?: "isolated" | "shared";
  retry_max_attempts?: number;
}

/**
 * Loose input shape — the tool `input` (a superset) is structurally
 * assignable. Optionals accept `undefined` so the zod-inferred tool
 * input (which carries `T | undefined`) matches under
 * `exactOptionalPropertyTypes`.
 */
export interface RepeatRetryInput {
  readonly repeat_count?: number | undefined;
  readonly repeat_mode?: ("isolated" | "shared") | undefined;
  readonly retry_max_attempts?: number | undefined;
}

/**
 * Build the request-body subset containing only the repeat / retry
 * fields that were actually supplied. Omitted fields are dropped so the
 * API keeps its defaults (create) or the existing value (update).
 */
export function pickRepeatRetryBody(input: RepeatRetryInput): RepeatRetryBody {
  const body: RepeatRetryBody = {};
  if (input.repeat_count !== undefined) body.repeat_count = input.repeat_count;
  if (input.repeat_mode !== undefined) body.repeat_mode = input.repeat_mode;
  if (input.retry_max_attempts !== undefined) {
    body.retry_max_attempts = input.retry_max_attempts;
  }
  return body;
}
