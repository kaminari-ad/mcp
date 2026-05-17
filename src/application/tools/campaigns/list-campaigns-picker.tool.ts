/**
 * Tool: `list_campaigns_picker` — slim per-row campaign list for
 * selection UIs (autocomplete, combobox, "pick a campaign" prompts).
 *
 * Wraps `GET /api/v1/campaigns/picker`. Returns a bare array (not
 * paginated) — the API treats picker as a non-paginated lookup
 * table. Use `list_campaigns` when you need pagination + full
 * campaign details; use this tool when you only need (id, name,
 * group, archived flag) for selection.
 */

import { z } from "zod";

import type { CampaignPickerItem } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCampaignsPickerInputShape = {} as const;
type ListCampaignsPickerInputShape = typeof ListCampaignsPickerInputShape;

export type ListCampaignsPickerOutput = readonly CampaignPickerItem[];

export const listCampaignsPickerTool: Tool<
  ListCampaignsPickerInputShape,
  ListCampaignsPickerOutput
> = {
  name: "list_campaigns_picker",
  description:
    "Slim per-row campaign list for selection UIs — id, name, group_id, is_archived. Cheaper than `list_campaigns` for orgs with thousands of campaigns. Use `get_campaign(id)` after a selection to fetch full details.",
  annotations: {
    title: "List Campaigns (Picker)",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListCampaignsPickerInputShape),
  handler: async (_input, ctx): Promise<Result<ListCampaignsPickerOutput, ToolError>> => {
    const result = await ctx.api.listCampaignsPicker();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
