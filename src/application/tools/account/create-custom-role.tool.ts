/**
 * Tool: `create_custom_role` — define a custom organization role.
 */

import { z } from "zod";

import type { RoleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CreateCustomRoleInputShape = {
  name: z.string().min(1).max(100).describe("Display name for the role."),
  permissions: z
    .array(z.string().min(1).max(100))
    .min(1)
    .max(200)
    .describe(
      "Permission slugs the role grants (e.g. 'scans.read', 'campaigns.write'). Use `list_org_roles` to see permissions on existing system roles."
    ),
} as const;
type CreateCustomRoleInputShape = typeof CreateCustomRoleInputShape;

export type CreateCustomRoleOutput = RoleResponse;

export const createCustomRoleTool: Tool<CreateCustomRoleInputShape, CreateCustomRoleOutput> = {
  name: "create_custom_role",
  description:
    "Create a custom organization role with the supplied permission set. Returns the persisted role; assign it to users via `update_user_role`.",
  annotations: {
    title: "Create Custom Role",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreateCustomRoleInputShape),
  handler: async (input, ctx): Promise<Result<CreateCustomRoleOutput, ToolError>> => {
    const result = await ctx.api.createCustomRole({
      name: input.name,
      permissions: [...input.permissions],
    });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
