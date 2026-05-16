/**
 * Tool: `get_campaign_group` — one group by UUID.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetCampaignGroupInputShape = {
  group_id: z.string().uuid().describe("Campaign group UUID."),
} as const;
type GetCampaignGroupInputShape = typeof GetCampaignGroupInputShape;

export type GetCampaignGroupOutput = CampaignGroupResponse;

export const getCampaignGroupTool: Tool<GetCampaignGroupInputShape, GetCampaignGroupOutput> = {
  name: "get_campaign_group",
  description: "Get one campaign group by UUID with default/archive/pause flags and campaign count.",
      annotations: { title: "Get Campaign Group", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(GetCampaignGroupInputShape),
  handler: async (input, ctx): Promise<Result<GetCampaignGroupOutput, ToolError>> => {
    const result = await ctx.api.getCampaignGroup(input.group_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
