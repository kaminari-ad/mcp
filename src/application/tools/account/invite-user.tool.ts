/**
 * Tool: `invite_user` — send an invite email to add a new member.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { OrgUserResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const InviteUserInputShape = {
  email: z.string().email().describe("Email of the person to invite. They get a signup link."),
  role: z.string().min(1).describe("Role to assign on accept (use `list_org_roles` for valid values)."),
} as const;
type InviteUserInputShape = typeof InviteUserInputShape;

export type InviteUserOutput = OrgUserResponse;

export const inviteUserTool: Tool<InviteUserInputShape, InviteUserOutput> = {
  name: "invite_user",
  description:
    "Send an invitation email so a new person can join the caller's organization with a chosen role. Returns the pending member record.",
  annotations: {
    title: "Invite User",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(InviteUserInputShape),
  handler: async (input, ctx): Promise<Result<InviteUserOutput, ToolError>> => {
    const result = await ctx.api.inviteUser({ email: input.email, role: input.role });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
