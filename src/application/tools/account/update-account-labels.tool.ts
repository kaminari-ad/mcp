/**
 * Tool: `update_account_labels` — replace the org's full label set.
 *
 * The API replaces the full list (no merge); pass every label you
 * want to keep. ``position`` is derived from array order on update.
 */

import { z } from "zod";

import type { LabelDefinitionResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const LabelItem = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9_]+$/, "key must be snake_case ([a-z0-9_]+)")
    .describe("Stable snake_case identifier used in scan filters."),
  display_name: z.string().min(1).max(200).describe("Human-readable name shown in the UI."),
  auto_extract: z
    .boolean()
    .optional()
    .describe(
      "When true, the LLM auto-populates this label's value during scan classification. Defaults to false."
    ),
});

const UpdateAccountLabelsInputShape = {
  labels: z
    .array(LabelItem)
    .max(20)
    .describe(
      "REPLACEMENT list of all labels — pass every label you want to keep. Order in the array becomes `position`. Empty array removes all labels."
    ),
} as const;
type UpdateAccountLabelsInputShape = typeof UpdateAccountLabelsInputShape;

export interface UpdateAccountLabelsOutput {
  readonly items: readonly LabelDefinitionResponse[];
}

export const updateAccountLabelsTool: Tool<
  UpdateAccountLabelsInputShape,
  UpdateAccountLabelsOutput
> = {
  name: "update_account_labels",
  description:
    "REPLACE the organization's full set of custom label definitions. The API replaces the list (no merge); read the current list with `list_account_labels` first. Returns the persisted list with allocated positions.",
  annotations: {
    title: "Update Account Labels",
    readOnlyHint: false,
    // REPLACE semantics: passing `labels: []` wipes every label and
    // detaches the value on every scan that referenced one. Hint as
    // destructive so MCP clients that gate dangerous tools warn the
    // user before this call runs.
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateAccountLabelsInputShape),
  handler: async (input, ctx): Promise<Result<UpdateAccountLabelsOutput, ToolError>> => {
    const result = await ctx.api.updateAccountLabels({
      labels: input.labels.map((l) => ({
        key: l.key,
        display_name: l.display_name,
        auto_extract: l.auto_extract ?? false,
      })),
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value });
  },
};
