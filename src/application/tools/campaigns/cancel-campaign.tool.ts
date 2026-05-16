/**
 * Tool: `cancel_campaign` — cancel every pending scan across all
 * unfinished runs of a campaign. Pending scans get refunded.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { ArchiveOrCancelResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CancelCampaignInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID."),
} as const;
type CancelCampaignInputShape = typeof CancelCampaignInputShape;

export type CancelCampaignOutput = ArchiveOrCancelResponse;

export const cancelCampaignTool: Tool<CancelCampaignInputShape, CancelCampaignOutput> = {
  name: "cancel_campaign",
  description:
    "Cancel every pending scan across all unfinished runs of a campaign. Running scans complete normally; pending scans are marked cancelled and credits refunded. Returns count of cancelled scans.",
  annotations: {
    title: "Cancel Campaign",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(CancelCampaignInputShape),
  handler: async (input, ctx): Promise<Result<CancelCampaignOutput, ToolError>> => {
    const result = await ctx.api.cancelCampaign(input.campaign_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
