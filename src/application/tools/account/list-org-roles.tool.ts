/**
 * Tool: `list_org_roles` — every role defined for the organization
 * (system + custom), with the permission set each grants.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { OrgRoleResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListOrgRolesInputShape = {} as const;
type ListOrgRolesInputShape = typeof ListOrgRolesInputShape;

export interface ListOrgRolesOutput {
  readonly items: readonly OrgRoleResponse[];
  readonly total: number;
}

export const listOrgRolesTool: Tool<ListOrgRolesInputShape, ListOrgRolesOutput> = {
  name: "list_org_roles",
  description:
    "List the roles defined for the organization — built-in (owner, admin, member) plus any custom roles, with each role's permission set.",
  annotations: {
    title: "List Organization Roles",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListOrgRolesInputShape),
  handler: async (_input, ctx): Promise<Result<ListOrgRolesOutput, ToolError>> => {
    const result = await ctx.api.listOrgRoles();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
