/**
 * Tool: `list_org_users` — list members of the caller's organization
 * with their role and ownership flag.
 */

import { z } from "zod";

import type { UserResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListOrgUsersInputShape = {} as const;
type ListOrgUsersInputShape = typeof ListOrgUsersInputShape;

export interface ListOrgUsersOutput {
  readonly items: readonly UserResponse[];
  readonly total: number;
}

export const listOrgUsersTool: Tool<ListOrgUsersInputShape, ListOrgUsersOutput> = {
  name: "list_org_users",
  description:
    "List every member of the caller's organization with their role, ownership flag, and join date.",
  annotations: {
    title: "List Organization Members",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListOrgUsersInputShape),
  handler: async (_input, ctx): Promise<Result<ListOrgUsersOutput, ToolError>> => {
    const result = await ctx.api.listOrgUsers();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
