/**
 * Shared filter fields for the three alert-reading surfaces.
 *
 * `GET /api/v1/alerts`, `GET /api/v1/alerts/stats` and the
 * `filter_*` half of `POST /api/v1/alerts/bulk-status` accept the same
 * filter vocabulary, and the API guarantees the four stats buckets sum
 * to the list `total` for identical filters. Declaring the fields once
 * keeps that promise visible: if list and stats drift apart, the agent
 * gets counts that disagree with the rows it can see.
 */

import { z } from "zod";

/** Filters shared by the alert list and the stats endpoint. */
export const alertFilterFields = {
  campaign_id: z.string().uuid().optional().describe("Filter to one campaign's alerts."),
  policy_set_id: z
    .string()
    .optional()
    .describe(
      "Comma-separated policy-set UUIDs. Matches alerts raised by any of them; see `list_policy_sets`."
    ),
  tag: z
    .string()
    .optional()
    .describe("Comma-separated tag slugs. Matches alerts carrying any of them; see `list_tags`."),
  country_code: z
    .string()
    .optional()
    .describe("Comma-separated ISO 3166-1 alpha-2 country codes, e.g. US,DE,JP."),
  date_from: z
    .string()
    .date()
    .optional()
    .describe("ISO date (YYYY-MM-DD), inclusive lower bound on alert creation."),
  date_to: z
    .string()
    .date()
    .optional()
    .describe("ISO date (YYYY-MM-DD), inclusive upper bound on alert creation."),
  timezone: z
    .string()
    .optional()
    .describe(
      "IANA timezone (e.g. 'Europe/Berlin') the date bounds are read in. Defaults to UTC. Omitting both dates spans all time."
    ),
} as const;

export type AlertFilterFields = typeof alertFilterFields;

/**
 * Parsed tool input. Zod infers optional fields as `T | undefined`,
 * which is what a handler actually holds.
 */
export interface AlertFilterInput {
  readonly campaign_id?: string | undefined;
  readonly policy_set_id?: string | undefined;
  readonly tag?: string | undefined;
  readonly country_code?: string | undefined;
  readonly date_from?: string | undefined;
  readonly date_to?: string | undefined;
  readonly timezone?: string | undefined;
}

/**
 * The same fields under `exactOptionalPropertyTypes`: an absent filter
 * is a missing key, never an explicit `undefined`, which is what the
 * gateway's filter types require.
 */
export type AlertFilterQuery = { readonly [K in keyof AlertFilterInput]?: string };

/**
 * Project only the defined filter fields onto a query object.
 *
 * `exactOptionalPropertyTypes` forbids forwarding an explicit
 * `undefined`, so absent filters must be omitted rather than passed.
 */
export function toAlertFilterQuery(input: AlertFilterInput): AlertFilterQuery {
  return {
    ...(input.campaign_id !== undefined ? { campaign_id: input.campaign_id } : {}),
    ...(input.policy_set_id !== undefined ? { policy_set_id: input.policy_set_id } : {}),
    ...(input.tag !== undefined ? { tag: input.tag } : {}),
    ...(input.country_code !== undefined ? { country_code: input.country_code } : {}),
    ...(input.date_from !== undefined ? { date_from: input.date_from } : {}),
    ...(input.date_to !== undefined ? { date_to: input.date_to } : {}),
    ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
  };
}
