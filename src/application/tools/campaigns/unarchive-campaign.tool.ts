/**
 * Tool: `unarchive_campaign` — restore an archived campaign so it
 * appears in default lists and (if `schedule_enabled`) starts running
 * again.
 */

import { z } from "zod";

import type { CampaignResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UnarchiveCampaignInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID."),
} as const;
type UnarchiveCampaignInputShape = typeof UnarchiveCampaignInputShape;

export type UnarchiveCampaignOutput = CampaignResponse;

export const unarchiveCampaignTool: Tool<UnarchiveCampaignInputShape, UnarchiveCampaignOutput> = {
  name: "unarchive_campaign",
  description:
    "Restore an archived campaign. Inverse of `archive_campaign`. The campaign re-appears in default lists; if `schedule_enabled` was true, the scheduler resumes producing runs.",
  annotations: {
    title: "Unarchive Campaign",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UnarchiveCampaignInputShape),
  handler: async (input, ctx): Promise<Result<UnarchiveCampaignOutput, ToolError>> => {
    const result = await ctx.api.unarchiveCampaign(input.campaign_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
