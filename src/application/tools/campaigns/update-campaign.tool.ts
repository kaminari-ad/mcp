/**
 * Tool: `update_campaign` — patch one campaign.
 *
 * Wraps `PATCH /api/v1/campaigns/{id}`. Only fields explicitly supplied
 * are updated. To clear `policy_set_id`, pass `null`.
 */

import { z } from "zod";

import type { CampaignResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";
import { campaignConfigFields, pickCampaignConfigBody } from "./_campaign-config-fields.js";

const UpdateCampaignInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID to update."),
  name: z.string().min(1).max(200).optional().describe("New display name."),
  url: z.string().url().optional().describe("New target URL (url-type campaigns)."),
  ad_tag: z
    .string()
    .optional()
    .describe(
      "New ad-tag HTML/JS or an http(s) URL of a page with the rendered " +
        "creative (ad_tag-type campaigns)."
    ),
  country_codes: z.array(z.string().length(2)).optional().describe("Replace the country list."),
  group_id: z.string().uuid().optional().describe("Move the campaign to another group."),
  ...campaignConfigFields,
  labels: z.record(z.string()).optional().describe("Replace the label map."),
  policy_set_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .describe("New policy set UUID; pass null to clear."),
  schedule_enabled: z.boolean().optional().describe("Pause / resume the scheduler."),
} as const;
type UpdateCampaignInputShape = typeof UpdateCampaignInputShape;

export type UpdateCampaignOutput = CampaignResponse;

export const updateCampaignTool: Tool<UpdateCampaignInputShape, UpdateCampaignOutput> = {
  name: "update_campaign",
  description:
    "Update one or more fields of a campaign. Fields not supplied are left unchanged. `policy_set_id` accepts null to clear the binding.",
  annotations: {
    title: "Update Campaign",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateCampaignInputShape),
  handler: async (input, ctx): Promise<Result<UpdateCampaignOutput, ToolError>> => {
    const body = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.ad_tag !== undefined ? { ad_tag: input.ad_tag } : {}),
      ...(input.country_codes !== undefined ? { country_codes: input.country_codes } : {}),
      ...(input.group_id !== undefined ? { group_id: input.group_id } : {}),
      ...(input.labels !== undefined ? { labels: input.labels } : {}),
      ...(input.policy_set_id !== undefined ? { policy_set_id: input.policy_set_id } : {}),
      ...(input.schedule_enabled !== undefined ? { schedule_enabled: input.schedule_enabled } : {}),
      ...pickCampaignConfigBody(input),
    };
    const result = await ctx.api.updateCampaign(input.campaign_id, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
