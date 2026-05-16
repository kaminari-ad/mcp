/**
 * Tool: `unarchive_campaign_group` — restore an archived group.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UnarchiveCampaignGroupInputShape = {
  group_id: z.string().uuid().describe("Campaign group UUID."),
} as const;
type UnarchiveCampaignGroupInputShape = typeof UnarchiveCampaignGroupInputShape;

export type UnarchiveCampaignGroupOutput = CampaignGroupResponse;

export const unarchiveCampaignGroupTool: Tool<
  UnarchiveCampaignGroupInputShape,
  UnarchiveCampaignGroupOutput
> = {
  name: "unarchive_campaign_group",
  description: "Restore an archived campaign group and re-expose its campaigns in default lists.",
  annotations: {
    title: "Unarchive Campaign Group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UnarchiveCampaignGroupInputShape),
  handler: async (input, ctx): Promise<Result<UnarchiveCampaignGroupOutput, ToolError>> => {
    const result = await ctx.api.unarchiveCampaignGroup(input.group_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
