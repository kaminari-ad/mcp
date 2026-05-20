/**
 * Tool: `list_campaigns_picker` — slim per-row campaign list for
 * selection UIs (autocomplete, combobox, "pick a campaign" prompts).
 *
 * Wraps `GET /api/v1/campaigns/picker`. Returns a bare array (not
 * paginated) — the API treats picker as a non-paginated lookup
 * table capped by `limit`. Use `list_campaigns` when you need
 * pagination + full campaign details; use this tool when you only
 * need (id, name, group, archived flag) for selection.
 */

import { z } from "zod";

import type { CampaignPickerItem } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListCampaignsPickerInputShape = {
  archived: z
    .boolean()
    .optional()
    .describe("Pass true to include archived campaigns. Defaults to active-only."),
  group_id: z.string().uuid().optional().describe("Filter to one campaign group."),
  q: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Substring search against campaign name (case-insensitive)."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe("Maximum rows to return (default per API, typically 200)."),
} as const;
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
  handler: async (input, ctx): Promise<Result<ListCampaignsPickerOutput, ToolError>> => {
    const filters = {
      ...(input.archived !== undefined ? { archived: input.archived } : {}),
      ...(input.group_id !== undefined ? { group_id: input.group_id } : {}),
      ...(input.q !== undefined ? { q: input.q } : {}),
      ...(input.limit !== undefined ? { limit: input.limit } : {}),
    };
    const result = await ctx.api.listCampaignsPicker(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
