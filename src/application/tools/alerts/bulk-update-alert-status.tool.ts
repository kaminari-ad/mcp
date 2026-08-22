/**
 * Tool: `bulk_update_alert_status` — move many alerts through their
 * lifecycle in one call.
 */

import { z } from "zod";

import type { BulkUpdateAlertStatusResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const MAX_IDS = 1000;

const BulkUpdateAlertStatusInputShape = {
  status: z
    .enum(["open", "escalated", "resolved", "dismissed"])
    .describe("Status to move the selected alerts to."),
  ids: z
    .array(z.string().uuid())
    .min(1)
    .max(MAX_IDS)
    .optional()
    .describe(
      `Explicit alert UUIDs, at most ${String(MAX_IDS)} per call. Mutually exclusive with \`all_matching\`.`
    ),
  all_matching: z
    .boolean()
    .optional()
    .describe(
      "Apply to every alert matching the `filter_*` fields instead of an id list. With no filters this means EVERY alert in the organization, so filter first and confirm the scope with `get_alert_stats` using the same filters."
    ),
  filter_status: z
    .enum(["open", "escalated", "resolved", "dismissed"])
    .optional()
    .describe("Only with `all_matching`: restrict to alerts currently in this status."),
  filter_campaign_id: z
    .string()
    .uuid()
    .optional()
    .describe("Only with `all_matching`: restrict to one campaign."),
  filter_policy_set_ids: z
    .array(z.string().uuid())
    .min(1)
    .optional()
    .describe("Only with `all_matching`: restrict to alerts raised by any of these policy sets."),
  filter_tag_slugs: z
    .array(z.string().min(1))
    .min(1)
    .optional()
    .describe("Only with `all_matching`: restrict to alerts carrying any of these tag slugs."),
  filter_country_codes: z
    .array(z.string().min(2).max(2))
    .min(1)
    .optional()
    .describe("Only with `all_matching`: restrict to these ISO 3166-1 alpha-2 countries."),
  filter_date_from: z
    .string()
    .date()
    .optional()
    .describe("Only with `all_matching`: inclusive lower bound (YYYY-MM-DD) on alert creation."),
  filter_date_to: z
    .string()
    .date()
    .optional()
    .describe("Only with `all_matching`: inclusive upper bound (YYYY-MM-DD) on alert creation."),
  filter_timezone: z
    .string()
    .optional()
    .describe(
      "IANA timezone for the filter date bounds. REQUIRED by the API whenever either date is set."
    ),
} as const;
type BulkUpdateAlertStatusInputShape = typeof BulkUpdateAlertStatusInputShape;

export type BulkUpdateAlertStatusOutput = BulkUpdateAlertStatusResponse;

export const bulkUpdateAlertStatusTool: Tool<
  BulkUpdateAlertStatusInputShape,
  BulkUpdateAlertStatusOutput
> = {
  name: "bulk_update_alert_status",
  description:
    "Change the status of many alerts at once. Select EITHER an explicit `ids` list (max 1000) OR `all_matching: true` with the `filter_*` fields, which mirror `list_alerts`. Alerts already in a state the transition cannot leave are skipped rather than failing the call, so the response reports `updated` and `skipped` counts — compare `updated + skipped` against the selection size to see how many were no-ops. Prefer `update_alert_status` for a single alert.",
  annotations: {
    title: "Bulk Update Alert Status",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(BulkUpdateAlertStatusInputShape),
  handler: async (input, ctx): Promise<Result<BulkUpdateAlertStatusOutput, ToolError>> => {
    // The API requires exactly one selection mode and rejects a date
    // bound without a timezone. Refusing locally saves the agent a
    // round trip; cross-field rules cannot live in `inputSchema`
    // because the SDK needs a plain ZodObject there.
    const matchesAll = input.all_matching === true;
    if ((input.ids !== undefined) === matchesAll) {
      return err({
        kind: "invalid-input",
        message:
          "Select alerts with either `ids` or `all_matching: true` — not both, and not neither.",
      });
    }
    if (
      (input.filter_date_from !== undefined || input.filter_date_to !== undefined) &&
      input.filter_timezone === undefined
    ) {
      return err({
        kind: "invalid-input",
        message: "filter_timezone is required whenever filter_date_from or filter_date_to is set.",
        fieldErrors: { filter_timezone: ["required alongside a filter date bound"] },
      });
    }
    const result = await ctx.api.bulkUpdateAlertStatus({
      status: input.status,
      all_matching: matchesAll,
      ...(input.ids !== undefined ? { ids: [...input.ids] } : {}),
      ...(input.filter_status !== undefined ? { filter_status: input.filter_status } : {}),
      ...(input.filter_campaign_id !== undefined
        ? { filter_campaign_id: input.filter_campaign_id }
        : {}),
      ...(input.filter_policy_set_ids !== undefined
        ? { filter_policy_set_ids: [...input.filter_policy_set_ids] }
        : {}),
      ...(input.filter_tag_slugs !== undefined
        ? { filter_tag_slugs: [...input.filter_tag_slugs] }
        : {}),
      ...(input.filter_country_codes !== undefined
        ? { filter_country_codes: [...input.filter_country_codes] }
        : {}),
      ...(input.filter_date_from !== undefined ? { filter_date_from: input.filter_date_from } : {}),
      ...(input.filter_date_to !== undefined ? { filter_date_to: input.filter_date_to } : {}),
      ...(input.filter_timezone !== undefined ? { filter_timezone: input.filter_timezone } : {}),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
