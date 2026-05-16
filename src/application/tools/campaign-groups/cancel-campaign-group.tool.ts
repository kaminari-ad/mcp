/**
 * Tool: `cancel_campaign_group` — cancel every pending scan across
 * every campaign in the group.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { ArchiveOrCancelResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CancelCampaignGroupInputShape = {
  group_id: z.string().uuid().describe("Campaign group UUID."),
} as const;
type CancelCampaignGroupInputShape = typeof CancelCampaignGroupInputShape;

export type CancelCampaignGroupOutput = ArchiveOrCancelResponse;

export const cancelCampaignGroupTool: Tool<CancelCampaignGroupInputShape, CancelCampaignGroupOutput> = {
  name: "cancel_campaign_group",
  description:
    "Cancel every pending scan across every campaign in the group. Refunds credits for cancelled scans. Returns the total cancelled count.",
  annotations: {
    title: "Cancel Campaign Group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(CancelCampaignGroupInputShape),
  handler: async (input, ctx): Promise<Result<CancelCampaignGroupOutput, ToolError>> => {
    const result = await ctx.api.cancelCampaignGroup(input.group_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
