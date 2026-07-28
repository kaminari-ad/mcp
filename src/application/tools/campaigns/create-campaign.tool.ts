/**
 * Tool: `create_campaign` — create a campaign with scheduled scans.
 *
 * Wraps `POST /api/v1/campaigns`. **A campaign is a recurring template;**
 * actual scans are queued by the scheduler each run. Cost is per-run,
 * not per-create.
 */

import { z } from "zod";

import type { CampaignResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { campaignConfigFields, pickCampaignConfigBody } from "./_campaign-config-fields.js";
import { campaignReferrerField } from "./_campaign-referrer-input.js";

const CreateCampaignInputShape = {
  name: z.string().min(1).max(200).describe("Display name (1-200 chars)."),
  campaign_type: z
    .enum(["url", "ad_tag", "vast", "ad_discovery"])
    .describe(
      "`url`, `ad_tag`, `vast`, or `ad_discovery` — must match the target field below. " +
        "`ad_discovery` is a publisher-page scan: set `url`; each run detects the page's " +
        "ad blocks and opens a child scan per detected ad."
    ),
  url: z
    .string()
    .url()
    .optional()
    .describe("Target URL (required if campaign_type=url or ad_discovery)."),
  ad_tag: z
    .string()
    .optional()
    .describe(
      "Ad-tag HTML/JS or an http(s) URL of a page with the rendered creative " +
        "(required if campaign_type=ad_tag)."
    ),
  vast_tag: z
    .string()
    .optional()
    .describe(
      "VAST video ad tag: an http(s) URL of a VAST endpoint OR raw VAST XML " +
        "(required if campaign_type=vast)."
    ),
  referrer: campaignReferrerField,
  country_codes: z
    .array(z.string().length(2))
    .min(1)
    .describe("ISO 3166-1 alpha-2 codes — one scan per country per run."),
  group_id: z
    .string()
    .uuid()
    .optional()
    .describe("Parent group UUID; defaults to the org's default group."),
  ...campaignConfigFields,
  labels: z
    .record(z.string())
    .optional()
    .describe("Arbitrary metadata applied to every queued scan."),
  policy_set_id: z
    .string()
    .uuid()
    .optional()
    .describe("Policy set to evaluate every scan against."),
  schedule_enabled: z
    .boolean()
    .optional()
    .describe("If true, the scheduler runs immediately. Default: false (manual run)."),
} as const;
type CreateCampaignInputShape = typeof CreateCampaignInputShape;

export type CreateCampaignOutput = CampaignResponse;

export const createCampaignTool: Tool<CreateCampaignInputShape, CreateCampaignOutput> = {
  name: "create_campaign",
  description:
    "Create a recurring scan campaign (template). The schedule produces N scans per run where N = number of countries times number of device profiles times `repeat_count`. Scans cost credits when they run, not when the campaign is created, so a high `repeat_count` multiplies the bill on every run. The returned campaign echoes `repeat_count`, `repeat_mode`, and `retry_max_attempts`, so read it back to confirm what the campaign will do.",
  annotations: {
    title: "Create Campaign",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreateCampaignInputShape),
  handler: async (input, ctx): Promise<Result<CreateCampaignOutput, ToolError>> => {
    const body = {
      name: input.name,
      campaign_type: input.campaign_type,
      country_codes: input.country_codes,
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.ad_tag !== undefined ? { ad_tag: input.ad_tag } : {}),
      ...(input.vast_tag !== undefined ? { vast_tag: input.vast_tag } : {}),
      ...(input.referrer !== undefined ? { referrer: input.referrer } : {}),
      ...(input.group_id !== undefined ? { group_id: input.group_id } : {}),
      ...(input.labels !== undefined ? { labels: input.labels } : {}),
      ...(input.policy_set_id !== undefined ? { policy_set_id: input.policy_set_id } : {}),
      ...(input.schedule_enabled !== undefined ? { schedule_enabled: input.schedule_enabled } : {}),
      ...pickCampaignConfigBody(input),
    };
    const result = await ctx.api.createCampaign(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
