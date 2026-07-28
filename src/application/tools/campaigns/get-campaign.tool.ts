/**
 * Tool: `get_campaign` — one campaign by UUID.
 */

import { z } from "zod";

import type { CampaignResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetCampaignInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID."),
} as const;
type GetCampaignInputShape = typeof GetCampaignInputShape;

export type GetCampaignOutput = CampaignResponse;

export const getCampaignTool: Tool<GetCampaignInputShape, GetCampaignOutput> = {
  name: "get_campaign",
  description:
    "Get one campaign by UUID: name, type (url|ad_tag|vast|ad_discovery), target URL / ad-tag / VAST tag (vast_tag), countries, emulator selection, proxy targeting, schedule status, archive status, parent group. Also echoes the repeat / retry settings — `repeat_count`, `repeat_mode`, `retry_max_attempts` — so this is how you confirm what `create_campaign` or `update_campaign` actually saved, and how many scans a run will produce (countries x device profiles x `repeat_count`). `ad_discovery` campaigns store the publisher page in the URL field.",
  annotations: {
    title: "Get Campaign",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetCampaignInputShape),
  handler: async (input, ctx): Promise<Result<GetCampaignOutput, ToolError>> => {
    const result = await ctx.api.getCampaign(input.campaign_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
