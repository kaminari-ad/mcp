/**
 * Tool: `delete_alert_destination` — remove a notification channel.
 * The org stops receiving pings on this channel immediately.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const DeleteAlertDestinationInputShape = {
  destination_id: z.string().uuid().describe("Destination UUID."),
} as const;
type DeleteAlertDestinationInputShape = typeof DeleteAlertDestinationInputShape;

export interface DeleteAlertDestinationOutput {
  readonly deleted: true;
}

export const deleteAlertDestinationTool: Tool<
  DeleteAlertDestinationInputShape,
  DeleteAlertDestinationOutput
> = {
  name: "delete_alert_destination",
  description:
    "Remove an alert-notification destination. The org stops receiving pings on this channel immediately; campaign-level overrides referencing it are pruned.",
  annotations: {
    title: "Delete Alert Destination",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(DeleteAlertDestinationInputShape),
  handler: async (
    input,
    ctx
  ): Promise<Result<DeleteAlertDestinationOutput, ToolError>> => {
    const result = await ctx.api.deleteAlertDestination(input.destination_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ deleted: true });
  },
};
