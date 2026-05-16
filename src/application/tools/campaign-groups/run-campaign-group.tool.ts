/**
 * Tool: `run_campaign_group` — fire an immediate run of every active
 * campaign in the group.
 */

import { z } from "zod";

import type { GroupActionResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const RunCampaignGroupInputShape = {
  group_id: z.string().uuid().describe("Campaign group UUID."),
} as const;
type RunCampaignGroupInputShape = typeof RunCampaignGroupInputShape;

export type RunCampaignGroupOutput = GroupActionResponse;

export const runCampaignGroupTool: Tool<RunCampaignGroupInputShape, RunCampaignGroupOutput> = {
  name: "run_campaign_group",
  description:
    "Fire an immediate run of every active (non-archived, non-paused) campaign in the group. Returns aggregate stats: how many campaigns triggered, the per-campaign run UUIDs, and any per-campaign failures.",
  annotations: {
    title: "Run Campaign Group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(RunCampaignGroupInputShape),
  handler: async (input, ctx): Promise<Result<RunCampaignGroupOutput, ToolError>> => {
    const result = await ctx.api.runCampaignGroup(input.group_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
