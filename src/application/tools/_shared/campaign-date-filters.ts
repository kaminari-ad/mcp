/**
 * Date + name filters shared by `list_campaigns` and
 * `list_campaign_groups`.
 *
 * The two endpoints accept the same vocabulary, so the fields are
 * declared once here rather than duplicated across the two domain
 * directories.
 */

import { z } from "zod";

export const campaignDateFilterFields = {
  created_from: z
    .string()
    .date()
    .optional()
    .describe("ISO date (YYYY-MM-DD), inclusive lower bound on the creation day."),
  created_to: z
    .string()
    .date()
    .optional()
    .describe("ISO date (YYYY-MM-DD), inclusive upper bound on the creation day."),
  last_run_from: z
    .string()
    .date()
    .optional()
    .describe(
      "ISO date (YYYY-MM-DD), inclusive lower bound on the most recent run. Setting either last-run bound excludes anything that has never run."
    ),
  last_run_to: z
    .string()
    .date()
    .optional()
    .describe("ISO date (YYYY-MM-DD), inclusive upper bound on the most recent run."),
  timezone: z
    .string()
    .optional()
    .describe("IANA timezone (e.g. 'Europe/Berlin') the date bounds are read in. Defaults to UTC."),
} as const;

export type CampaignDateFilterFields = typeof campaignDateFilterFields;

/** Parsed tool input — zod infers optional fields as `T | undefined`. */
export interface CampaignDateFilterInput {
  readonly created_from?: string | undefined;
  readonly created_to?: string | undefined;
  readonly last_run_from?: string | undefined;
  readonly last_run_to?: string | undefined;
  readonly timezone?: string | undefined;
}

/** Same fields with exact-optional keys, as the gateway types require. */
export type CampaignDateFilterQuery = {
  readonly [K in keyof CampaignDateFilterInput]?: string;
};

/** Project only the defined date filters onto a query object. */
export function toCampaignDateFilterQuery(input: CampaignDateFilterInput): CampaignDateFilterQuery {
  return {
    ...(input.created_from !== undefined ? { created_from: input.created_from } : {}),
    ...(input.created_to !== undefined ? { created_to: input.created_to } : {}),
    ...(input.last_run_from !== undefined ? { last_run_from: input.last_run_from } : {}),
    ...(input.last_run_to !== undefined ? { last_run_to: input.last_run_to } : {}),
    ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
  };
}
