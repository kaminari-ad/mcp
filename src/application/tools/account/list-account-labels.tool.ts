/**
 * Tool: `list_account_labels` — list the org's custom label
 * definitions used to enrich scans.
 *
 * Labels are per-org metadata keys (brand_safety, vertical, …) that
 * appear on every scan. When `auto_extract=true`, the LLM populates
 * the value during classification; otherwise the user / API caller
 * sets it on scan create. Filter scans by label via `list_scans`'
 * `labels: { key: value }` parameter.
 */

import { z } from "zod";

import type { LabelDefinitionResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListAccountLabelsInputShape = {} as const;
type ListAccountLabelsInputShape = typeof ListAccountLabelsInputShape;

export interface ListAccountLabelsOutput {
  readonly items: readonly LabelDefinitionResponse[];
}

export const listAccountLabelsTool: Tool<ListAccountLabelsInputShape, ListAccountLabelsOutput> = {
  name: "list_account_labels",
  description:
    "List the organization's custom label definitions (key, display_name, position, auto_extract). Labels enrich scans and can be used as filters in `list_scans`.",
  annotations: {
    title: "List Account Labels",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListAccountLabelsInputShape),
  handler: async (_input, ctx): Promise<Result<ListAccountLabelsOutput, ToolError>> => {
    const result = await ctx.api.listAccountLabels();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value });
  },
};
