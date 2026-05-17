/**
 * Tool: `remove_user` — revoke a member's access to the organization.
 *
 * Destructive: the user loses access immediately.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const RemoveUserInputShape = {
  user_id: z.string().uuid().describe("UUID of the member to remove."),
} as const;
type RemoveUserInputShape = typeof RemoveUserInputShape;

export interface RemoveUserOutput {
  readonly removed: true;
}

export const removeUserTool: Tool<RemoveUserInputShape, RemoveUserOutput> = {
  name: "remove_user",
  description:
    "Revoke a member's access to the organization. The user is signed out and any active API keys they created remain unless revoked separately. CANNOT remove the owner — use `transfer_ownership` first.",
  annotations: {
    title: "Remove User",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(RemoveUserInputShape),
  handler: async (input, ctx): Promise<Result<RemoveUserOutput, ToolError>> => {
    const result = await ctx.api.removeUser(input.user_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ removed: true });
  },
};
