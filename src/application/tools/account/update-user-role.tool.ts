/**
 * Tool: `update_user_role` — change a member's role.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateUserRoleInputShape = {
  user_id: z.string().uuid().describe("UUID of the member to update."),
  role_id: z.string().uuid().describe("UUID of the new role (see `list_org_roles`)."),
} as const;
type UpdateUserRoleInputShape = typeof UpdateUserRoleInputShape;

export interface UpdateUserRoleOutput {
  readonly updated: true;
}

export const updateUserRoleTool: Tool<UpdateUserRoleInputShape, UpdateUserRoleOutput> = {
  name: "update_user_role",
  description:
    "Change an organization member's role. The owner role can only be transferred via `transfer_ownership`. Returns `{updated: true}` on success; refetch with `list_org_users` if you need the new role echoed.",
  annotations: {
    title: "Update User Role",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateUserRoleInputShape),
  handler: async (input, ctx): Promise<Result<UpdateUserRoleOutput, ToolError>> => {
    // API returns 204 No Content on success.
    const result = await ctx.api.updateUserRole(input.user_id, { role_id: input.role_id });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ updated: true });
  },
};
