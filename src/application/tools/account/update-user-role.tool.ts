/**
 * Tool: `update_user_role` — change a member's role.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { OrgUserResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const UpdateUserRoleInputShape = {
  user_id: z.string().uuid().describe("UUID of the member to update."),
  role: z.string().min(1).describe("New role slug (see `list_org_roles`)."),
} as const;
type UpdateUserRoleInputShape = typeof UpdateUserRoleInputShape;

export type UpdateUserRoleOutput = OrgUserResponse;

export const updateUserRoleTool: Tool<UpdateUserRoleInputShape, UpdateUserRoleOutput> = {
  name: "update_user_role",
  description: "Change an organization member's role. The owner role can only be transferred via `transfer_ownership`.",
  annotations: {
    title: "Update User Role",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(UpdateUserRoleInputShape),
  handler: async (input, ctx): Promise<Result<UpdateUserRoleOutput, ToolError>> => {
    const result = await ctx.api.updateUserRole(input.user_id, { role: input.role });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
