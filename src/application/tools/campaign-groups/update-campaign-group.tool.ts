/**
 * Tool: `update_campaign_group` — rename a campaign group.
 *
 * Pausing/resuming a group's scheduler is a separate operation — use
 * `pause_campaign_group_schedule` / `resume_campaign_group_schedule`.
 */

import { z } from "zod";

import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateCampaignGroupInputShape = {
  group_id: z.string().uuid().describe("Group UUID to update."),
  name: z.string().min(1).max(200).optional().describe("New display name."),
} as const;
type UpdateCampaignGroupInputShape = typeof UpdateCampaignGroupInputShape;

export type UpdateCampaignGroupOutput = CampaignGroupResponse;

export const updateCampaignGroupTool: Tool<
  UpdateCampaignGroupInputShape,
  UpdateCampaignGroupOutput
> = {
  name: "update_campaign_group",
  description:
    "Rename a campaign group. To pause/resume its scheduler, use `pause_campaign_group_schedule` / `resume_campaign_group_schedule` instead.",
  annotations: {
    title: "Update Campaign Group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateCampaignGroupInputShape),
  handler: async (input, ctx): Promise<Result<UpdateCampaignGroupOutput, ToolError>> => {
    const body = {
      ...(input.name !== undefined ? { name: input.name } : {}),
    };
    const result = await ctx.api.updateCampaignGroup(input.group_id, body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
