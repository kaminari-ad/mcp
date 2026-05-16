/**
 * Tool: `get_campaign` — one campaign by UUID.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CampaignResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

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
        "Get one campaign by UUID: name, type, target URL/ad-tag, countries, schedule status, archive status, parent group.",
      annotations: { title: "Get Campaign", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(GetCampaignInputShape),
  handler: async (input, ctx): Promise<Result<GetCampaignOutput, ToolError>> => {
    const result = await ctx.api.getCampaign(input.campaign_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
