/**
 * Tool: `list_alert_destinations` — channels (Slack / Telegram /
 * Email / Webhook) the org has wired up to receive alert pings.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { AlertNotificationDestination } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListAlertDestinationsInputShape = {} as const;
type ListAlertDestinationsInputShape = typeof ListAlertDestinationsInputShape;

export interface ListAlertDestinationsOutput {
  readonly items: readonly AlertNotificationDestination[];
  readonly total: number;
}

export const listAlertDestinationsTool: Tool<
  ListAlertDestinationsInputShape,
  ListAlertDestinationsOutput
> = {
  name: "list_alert_destinations",
  description:
    "List configured alert-notification destinations (channels): Slack workspaces, Telegram chats, email lists, generic webhooks. Each entry has id, kind, display name, version, and creation timestamp.",
  annotations: {
    title: "List Alert Destinations",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListAlertDestinationsInputShape),
  handler: async (
    _input,
    ctx
  ): Promise<Result<ListAlertDestinationsOutput, ToolError>> => {
    const result = await ctx.api.listAlertDestinations();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
