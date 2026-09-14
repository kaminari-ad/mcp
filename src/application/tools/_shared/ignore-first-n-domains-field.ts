/**
 * Shared zod field for the leading-domain detection skip.
 *
 * `create_scan`, `create_bulk_scans`, `create_campaign` and `update_campaign`
 * all accept the same `ignore_first_n_domains`. Defining it once means the
 * agent-facing `.describe()` text — the only place an LLM learns that a skipped
 * domain is checked by NOTHING, and so that guessing high hides real findings —
 * cannot drift between the four surfaces.
 *
 * Unlike `max_discovered_ads` next door there is no nullable update variant:
 * `0` is the reset, and a second spelling of "skip nothing" would only invite
 * an agent to send `null` where the API answers 422. The field is `.optional()`
 * on create (omitted means 0, which is what every unconfigured campaign does)
 * and on update it is the value to write, so the per-surface sentence is the
 * only thing that differs.
 */
import { z } from "zod";

const IGNORE_FIRST_N_DOMAINS_DESCRIPTION =
  "How many leading domains of the redirect chain to exclude from detection and " +
  "tagging (0-5). Use it when the check enters through the caller's OWN click or " +
  "tracking domains: without it a reputation hit on one of those tags the material " +
  "and raises an alert about the caller's infrastructure rather than about the offer. " +
  "Counting starts at the entry point and follows chain order; domains fold to their " +
  "registrable form, so www.example.com and example.com consume one slot between " +
  "them, and any other request to one of those domains is excluded too. A skipped " +
  "domain is checked by NOTHING, so never set this higher than the number of domains " +
  "the caller actually owns at the head of the chain — ask rather than guess. The " +
  "full redirect chain is still captured and returned either way.";

const ignoreFirstNDomains = z.number().int().min(0).max(5);

export const ignoreFirstNDomainsField = ignoreFirstNDomains
  .optional()
  .describe(`${IGNORE_FIRST_N_DOMAINS_DESCRIPTION} Omit it to skip nothing (0).`);

export const ignoreFirstNDomainsScanField = ignoreFirstNDomains
  .optional()
  .describe(
    `${IGNORE_FIRST_N_DOMAINS_DESCRIPTION} Omit it to skip nothing (0). A scan ` +
      "created directly does NOT inherit this from the campaign named in " +
      "`campaign_id` — only scans queued by a campaign run do — so send it " +
      "explicitly on every direct submission that needs it."
  );

export const ignoreFirstNDomainsUpdateField = ignoreFirstNDomains
  .optional()
  .describe(
    `${IGNORE_FIRST_N_DOMAINS_DESCRIPTION} Omitting the field leaves the ` +
      "campaign's current setting unchanged; pass 0 to go back to skipping " +
      "nothing. Not nullable — null is rejected with 422."
  );
