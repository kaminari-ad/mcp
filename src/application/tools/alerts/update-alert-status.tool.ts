/**
 * Tool: `update_alert_status` — move an alert through its lifecycle
 * (open → ack → resolved | ignored).
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateAlertStatusInputShape = {
  alert_id: z.string().uuid().describe("Alert UUID."),
  status: z
    .enum(["open", "ack", "resolved", "ignored"])
    .describe("New status: open | ack | resolved | ignored."),
} as const;
type UpdateAlertStatusInputShape = typeof UpdateAlertStatusInputShape;

export interface UpdateAlertStatusOutput {
  readonly updated: true;
}

export const updateAlertStatusTool: Tool<UpdateAlertStatusInputShape, UpdateAlertStatusOutput> = {
  name: "update_alert_status",
  description:
    "Update an alert's status in its lifecycle: open → ack → resolved | ignored. The API enforces valid transitions; an invalid one returns 422.",
  annotations: {
    title: "Update Alert Status",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateAlertStatusInputShape),
  handler: async (input, ctx): Promise<Result<UpdateAlertStatusOutput, ToolError>> => {
    const result = await ctx.api.updateAlertStatus(input.alert_id, { status: input.status });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ updated: true });
  },
};
