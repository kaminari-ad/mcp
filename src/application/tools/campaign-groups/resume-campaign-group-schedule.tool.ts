/**
 * Tool: `resume_campaign_group_schedule` — re-enable the scheduler
 * for every campaign in the group.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ResumeCampaignGroupScheduleInputShape = {
  group_id: z.string().uuid().describe("Campaign group UUID."),
} as const;
type ResumeCampaignGroupScheduleInputShape = typeof ResumeCampaignGroupScheduleInputShape;

export type ResumeCampaignGroupScheduleOutput = CampaignGroupResponse;

export const resumeCampaignGroupScheduleTool: Tool<
  ResumeCampaignGroupScheduleInputShape,
  ResumeCampaignGroupScheduleOutput
> = {
  name: "resume_campaign_group_schedule",
  description: "Re-enable the scheduler for every campaign in the group. Inverse of `pause_campaign_group_schedule`.",
  annotations: {
    title: "Resume Group Schedule",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ResumeCampaignGroupScheduleInputShape),
  handler: async (
    input,
    ctx
  ): Promise<Result<ResumeCampaignGroupScheduleOutput, ToolError>> => {
    const result = await ctx.api.resumeCampaignGroupSchedule(input.group_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
