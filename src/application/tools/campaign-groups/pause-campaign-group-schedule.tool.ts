/**
 * Tool: `pause_campaign_group_schedule` — stop scheduled runs of
 * every campaign in the group. Existing pending scans keep running.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const PauseCampaignGroupScheduleInputShape = {
  group_id: z.string().uuid().describe("Campaign group UUID."),
} as const;
type PauseCampaignGroupScheduleInputShape = typeof PauseCampaignGroupScheduleInputShape;

export type PauseCampaignGroupScheduleOutput = CampaignGroupResponse;

export const pauseCampaignGroupScheduleTool: Tool<
  PauseCampaignGroupScheduleInputShape,
  PauseCampaignGroupScheduleOutput
> = {
  name: "pause_campaign_group_schedule",
  description:
    "Pause the scheduler for EVERY campaign in the group. Already-pending scans complete; no new scheduled runs are produced until you `resume_campaign_group_schedule`.",
  annotations: {
    title: "Pause Group Schedule",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(PauseCampaignGroupScheduleInputShape),
  handler: async (
    input,
    ctx
  ): Promise<Result<PauseCampaignGroupScheduleOutput, ToolError>> => {
    const result = await ctx.api.pauseCampaignGroupSchedule(input.group_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
