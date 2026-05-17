/**
 * Tool: `set_alert_destination_version` — switch a destination to a
 * different versioned config (e.g. swap Slack workspace after re-auth).
 *
 * API returns 204 No Content. The tool surfaces `{ updated: true }`
 * so JSON output stays a plain object; fetch the updated destination
 * via `list_alert_destinations` if the new state is needed.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const SetAlertDestinationVersionInputShape = {
  destination_id: z.string().uuid().describe("Destination UUID."),
  version: z
    .enum(["public", "internal"])
    .describe(
      "Which version of the scan-report link to embed in alert messages: `public` (anonymous, no auth) or `internal` (requires UI login)."
    ),
} as const;
type SetAlertDestinationVersionInputShape = typeof SetAlertDestinationVersionInputShape;

export interface SetAlertDestinationVersionOutput {
  readonly updated: true;
}

export const setAlertDestinationVersionTool: Tool<
  SetAlertDestinationVersionInputShape,
  SetAlertDestinationVersionOutput
> = {
  name: "set_alert_destination_version",
  description:
    "Switch a destination to a specific versioned config — used after re-authorizing a Slack workspace, rotating a Telegram bot token, etc. The new version must already exist in the destination's history. The API returns no body on success; this tool reports `{ updated: true }`. Use `list_alert_destinations` to read the new state if needed.",
  annotations: {
    title: "Set Destination Version",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(SetAlertDestinationVersionInputShape),
  handler: async (input, ctx): Promise<Result<SetAlertDestinationVersionOutput, ToolError>> => {
    const result = await ctx.api.setAlertDestinationVersion(input.destination_id, {
      version: input.version,
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ updated: true });
  },
};
