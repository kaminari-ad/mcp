/**
 * Tool: `archive_campaign` — soft-delete a campaign.
 *
 * Wraps `POST /api/v1/campaigns/{id}/archive`. The campaign is hidden
 * from default lists; existing scan history is preserved.
 */

import { z } from "zod";

import type { CampaignResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ArchiveCampaignInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID to archive."),
} as const;
type ArchiveCampaignInputShape = typeof ArchiveCampaignInputShape;

export type ArchiveCampaignOutput = CampaignResponse;

export const archiveCampaignTool: Tool<ArchiveCampaignInputShape, ArchiveCampaignOutput> = {
  name: "archive_campaign",
  description:
    "Soft-delete (archive) a campaign. Removes it from default lists and stops the scheduler; previously-collected scans are preserved.",
  annotations: {
    title: "Archive Campaign",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ArchiveCampaignInputShape),
  handler: async (input, ctx): Promise<Result<ArchiveCampaignOutput, ToolError>> => {
    const result = await ctx.api.archiveCampaign(input.campaign_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
