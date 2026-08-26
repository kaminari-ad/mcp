/**
 * Shared zod fields + body-builder for the campaign emulator / proxy /
 * repeat / schedule configuration.
 *
 * `create_campaign` and `update_campaign` both expose the exact same
 * emulator-selection, proxy-targeting, repeat/retry, and
 * schedule-definition fields (flat field names that match the API
 * request DTOs). Keeping them in one module means the two tools never
 * drift, the per-field `.describe()` text stays consistent for the
 * agent, and the repeated "forward only what was supplied" branching
 * lives in a single unit-tested helper.
 *
 * The repeat / retry trio is spread in from {@link repeatRetryFields}
 * rather than declared here, because the two scan-creation tools carry
 * the identical fields.
 *
 * Every field is `.optional()`: on create the API applies its own
 * defaults (`emulator_categories: ["android_phone"]`,
 * `emulator_mode: "random"`, `proxy_type: "residential"`, no schedule);
 * on update an omitted field is left unchanged.
 */
import { z } from "zod";

import {
  pickRepeatRetryBody,
  type RepeatRetryBody,
  repeatRetryFields,
  type RepeatRetryInput,
} from "../_shared/repeat-retry-fields.js";

/**
 * The shared raw zod shape spread into both campaign tools'
 * `inputSchema`. Field names mirror the API request DTOs exactly.
 */
export const campaignConfigFields = {
  emulator_categories: z
    .array(z.string())
    .optional()
    .describe(
      "Device categories to rotate through, e.g. ['android_phone']. " +
        "Valid: android_phone, android_tablet, iphone, ipad, windows_desktop, macos_desktop. " +
        "On create, omitting this defaults to ['android_phone']; pass [] together with " +
        "emulator_specific_ids to target ONLY specific devices."
    ),
  emulator_specific_ids: z
    .array(z.string())
    .optional()
    .describe(
      "Pin exact device profile slugs from `list_emulators` (the `id` field), " +
        "e.g. ['samsung_galaxy_s23_ultra_android16']. Always scanned regardless of emulator_mode."
    ),
  emulator_mode: z
    .enum(["random", "all"])
    .optional()
    .describe(
      "How selected categories expand per run: 'random' = one random device per category " +
        "(the UI's 'Random (1 per group)'), 'all' = every device in each category ('All checked'). " +
        "Does not affect emulator_specific_ids. Default: random."
    ),
  proxy_type: z
    .enum(["residential", "mobile"])
    .optional()
    .describe(
      "Proxy network type. Default: residential. Residential and mobile are separate pools with separate catalogues, so pass the same value to `get_proxy_targeting` that you send here."
    ),
  proxy_region: z
    .string()
    .optional()
    .describe(
      "Proxy region/state; use a value from `get_proxy_targeting` for one of this campaign's countries. Only honoured when the campaign targets a single country."
    ),
  proxy_city: z
    .string()
    .optional()
    .describe(
      "Proxy city from `get_proxy_targeting`. If you also set `proxy_region`, take the city from a call made with that same region — a city from a different region passes validation but leaves the provider no exit node."
    ),
  proxy_isp: z
    .string()
    .optional()
    .describe(
      "Proxy ISP, or mobile carrier when `proxy_type` is mobile. Use a value from `get_proxy_targeting`."
    ),
  ...repeatRetryFields,
  schedule_type: z
    .enum(["weekly", "interval"])
    .optional()
    .describe(
      "Scheduling mode: 'weekly' (run on a weekday/hour grid via schedule_weekly) or " +
        "'interval' (run every schedule_interval_seconds). Omit for a manual (run-on-demand) campaign."
    ),
  schedule_weekly: z
    .record(z.array(z.number().int().min(0).max(23)))
    .optional()
    .describe(
      "Weekly run grid for schedule_type='weekly'. Keys are weekdays '0'-'6' (Mon-Sun); " +
        "values are hours 0-23 in schedule_timezone, e.g. { '0': [9, 17], '4': [12] }."
    ),
  schedule_interval_seconds: z
    .number()
    .int()
    .optional()
    .describe(
      "Run interval for schedule_type='interval'. Allowed presets (seconds): " +
        "60, 120, 300, 600, 900, 1800, 2700, 3600, 7200, 14400, 28800, 86400."
    ),
  schedule_timezone: z
    .string()
    .optional()
    .describe("IANA timezone for the weekly grid, e.g. 'Europe/Berlin'. Default: UTC."),
} satisfies z.ZodRawShape;

/**
 * The subset of campaign config fields, all optional. Returned by
 * {@link pickCampaignConfigBody} — only keys that were actually supplied
 * are present, so the result is safe to spread into a request body
 * regardless of `exactOptionalPropertyTypes`.
 */
export interface CampaignConfigBody extends RepeatRetryBody {
  emulator_categories?: string[];
  emulator_specific_ids?: string[];
  emulator_mode?: "random" | "all";
  proxy_type?: "residential" | "mobile";
  proxy_region?: string;
  proxy_city?: string;
  proxy_isp?: string;
  schedule_type?: "weekly" | "interval";
  schedule_weekly?: Record<string, number[]>;
  schedule_interval_seconds?: number;
  schedule_timezone?: string;
}

/**
 * Loose input shape — the tool `input` (a superset) is structurally
 * assignable. Optionals accept `undefined` so the zod-inferred tool
 * input (which carries `T | undefined`) matches under
 * `exactOptionalPropertyTypes`.
 */
interface CampaignConfigInput extends RepeatRetryInput {
  readonly emulator_categories?: string[] | undefined;
  readonly emulator_specific_ids?: string[] | undefined;
  readonly emulator_mode?: ("random" | "all") | undefined;
  readonly proxy_type?: ("residential" | "mobile") | undefined;
  readonly proxy_region?: string | undefined;
  readonly proxy_city?: string | undefined;
  readonly proxy_isp?: string | undefined;
  readonly schedule_type?: ("weekly" | "interval") | undefined;
  readonly schedule_weekly?: Record<string, number[]> | undefined;
  readonly schedule_interval_seconds?: number | undefined;
  readonly schedule_timezone?: string | undefined;
}

/**
 * Build the request-body subset containing only the config fields that
 * were actually supplied. Omitted fields are dropped so the API keeps
 * its defaults (create) or the existing value (update).
 */
export function pickCampaignConfigBody(input: CampaignConfigInput): CampaignConfigBody {
  const body: CampaignConfigBody = { ...pickRepeatRetryBody(input) };
  if (input.emulator_categories !== undefined) body.emulator_categories = input.emulator_categories;
  if (input.emulator_specific_ids !== undefined) {
    body.emulator_specific_ids = input.emulator_specific_ids;
  }
  if (input.emulator_mode !== undefined) body.emulator_mode = input.emulator_mode;
  if (input.proxy_type !== undefined) body.proxy_type = input.proxy_type;
  if (input.proxy_region !== undefined) body.proxy_region = input.proxy_region;
  if (input.proxy_city !== undefined) body.proxy_city = input.proxy_city;
  if (input.proxy_isp !== undefined) body.proxy_isp = input.proxy_isp;
  if (input.schedule_type !== undefined) body.schedule_type = input.schedule_type;
  if (input.schedule_weekly !== undefined) body.schedule_weekly = input.schedule_weekly;
  if (input.schedule_interval_seconds !== undefined) {
    body.schedule_interval_seconds = input.schedule_interval_seconds;
  }
  if (input.schedule_timezone !== undefined) body.schedule_timezone = input.schedule_timezone;
  return body;
}
