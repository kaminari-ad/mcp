/**
 * Tool: `run_campaign` — trigger a single immediate run of a campaign
 * (in addition to whatever its schedule does).
 */

import { z } from "zod";

import type { RunResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const RunCampaignInputShape = {
  campaign_id: z.string().uuid().describe("Campaign UUID to run now."),
} as const;
type RunCampaignInputShape = typeof RunCampaignInputShape;

export type RunCampaignOutput = RunResponse;

export const runCampaignTool: Tool<RunCampaignInputShape, RunCampaignOutput> = {
  name: "run_campaign",
  description:
    "Trigger an immediate, ad-hoc run of a campaign. Costs N credits where N = number of countries × number of emulators in the campaign config. Returns the new run with progress counters (total / completed / failed / partial / cancelled); track further progress via `get_run`.",
  annotations: {
    title: "Run Campaign Now",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(RunCampaignInputShape),
  handler: async (input, ctx): Promise<Result<RunCampaignOutput, ToolError>> => {
    const result = await ctx.api.runCampaign(input.campaign_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
