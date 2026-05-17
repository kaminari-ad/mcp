/**
 * Tool: `archive_campaign_group` — soft-delete the group AND every
 * campaign inside it.
 */

import { z } from "zod";

import type { GroupActionResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ArchiveCampaignGroupInputShape = {
  group_id: z.string().uuid().describe("Campaign group UUID."),
} as const;
type ArchiveCampaignGroupInputShape = typeof ArchiveCampaignGroupInputShape;

/**
 * API returns a `GroupActionResponse` action summary (campaigns
 * affected, pending scans cancelled, failed campaign ids), NOT the
 * group entity. Same shape as `run_campaign_group` /
 * `cancel_campaign_group`.
 */
export type ArchiveCampaignGroupOutput = GroupActionResponse;

export const archiveCampaignGroupTool: Tool<
  ArchiveCampaignGroupInputShape,
  ArchiveCampaignGroupOutput
> = {
  name: "archive_campaign_group",
  description:
    "Soft-delete the group AND every campaign in it. The default group cannot be archived; ask the user to move campaigns out first.",
  annotations: {
    title: "Archive Campaign Group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ArchiveCampaignGroupInputShape),
  handler: async (input, ctx): Promise<Result<ArchiveCampaignGroupOutput, ToolError>> => {
    const result = await ctx.api.archiveCampaignGroup(input.group_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
