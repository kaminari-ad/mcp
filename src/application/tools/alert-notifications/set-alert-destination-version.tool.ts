/**
 * Tool: `set_alert_destination_version` — switch a destination to a
 * different versioned config (e.g. swap Slack workspace after re-auth).
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { AlertNotificationDestination } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const SetAlertDestinationVersionInputShape = {
  destination_id: z.string().uuid().describe("Destination UUID."),
  version: z.number().int().min(1).describe("Target config version number."),
} as const;
type SetAlertDestinationVersionInputShape = typeof SetAlertDestinationVersionInputShape;

export type SetAlertDestinationVersionOutput = AlertNotificationDestination;

export const setAlertDestinationVersionTool: Tool<
  SetAlertDestinationVersionInputShape,
  SetAlertDestinationVersionOutput
> = {
  name: "set_alert_destination_version",
  description:
    "Switch a destination to a specific versioned config — used after re-authorizing a Slack workspace, rotating a Telegram bot token, etc. The new version must already exist in the destination's history.",
  annotations: {
    title: "Set Destination Version",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(SetAlertDestinationVersionInputShape),
  handler: async (
    input,
    ctx
  ): Promise<Result<SetAlertDestinationVersionOutput, ToolError>> => {
    const result = await ctx.api.setAlertDestinationVersion(input.destination_id, {
      version: input.version,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
