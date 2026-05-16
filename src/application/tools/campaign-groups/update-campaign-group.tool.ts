/**
 * Tool: `update_campaign_group` — rename or pause a group's scheduler.
 *
 * Pausing a group pauses every campaign inside it.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateCampaignGroupInputShape = {
  group_id: z.string().uuid().describe("Group UUID to update."),
  name: z.string().min(1).max(200).optional().describe("New display name."),
  schedule_paused: z
    .boolean()
    .optional()
    .describe("Pause/resume the scheduler for every campaign in this group."),
} as const;
type UpdateCampaignGroupInputShape = typeof UpdateCampaignGroupInputShape;

export type UpdateCampaignGroupOutput = CampaignGroupResponse;

export const updateCampaignGroupTool: Tool<
  UpdateCampaignGroupInputShape,
  UpdateCampaignGroupOutput
> = {
  name: "update_campaign_group",
  description:
        "Update a campaign group: rename, or pause/resume the scheduler (the pause cascades to every campaign in the group).",
      annotations: { title: "Update Campaign Group", readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(UpdateCampaignGroupInputShape),
  handler: async (input, ctx): Promise<Result<UpdateCampaignGroupOutput, ToolError>> => {
    const body = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.schedule_paused !== undefined ? { schedule_paused: input.schedule_paused } : {}),
    };
    const result = await ctx.api.updateCampaignGroup(input.group_id, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
