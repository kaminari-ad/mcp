/**
 * Tool: `create_campaign_group` — create a new folder for grouping campaigns.
 *
 * Cheap — no scans queued.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { CampaignGroupResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CreateCampaignGroupInputShape = {
  name: z.string().min(1).max(200).describe("Display name (1-200 chars)."),
} as const;
type CreateCampaignGroupInputShape = typeof CreateCampaignGroupInputShape;

export type CreateCampaignGroupOutput = CampaignGroupResponse;

export const createCampaignGroupTool: Tool<
  CreateCampaignGroupInputShape,
  CreateCampaignGroupOutput
> = {
  name: "create_campaign_group",
  description: "Create a new campaign group (folder). Free operation, no scans queued.",
      annotations: { title: "Create Campaign Group", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  inputSchema: z.object(CreateCampaignGroupInputShape),
  handler: async (input, ctx): Promise<Result<CreateCampaignGroupOutput, ToolError>> => {
    const result = await ctx.api.createCampaignGroup({ name: input.name });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
