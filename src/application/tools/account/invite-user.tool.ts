/**
 * Tool: `invite_user` — send an invite email to add a new member.
 */

import { z } from "zod";

import type { UserResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const InviteUserInputShape = {
  email: z.string().email().describe("Email of the person to invite. They get a signup link."),
  role_id: z
    .string()
    .uuid()
    .describe("UUID of the role to assign on accept. Get UUIDs from `list_org_roles`."),
  name: z.string().min(1).optional().describe("Optional display name for the invitee."),
} as const;
type InviteUserInputShape = typeof InviteUserInputShape;

export type InviteUserOutput = UserResponse;

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
    const body: { email: string; role_id: string; name?: string } = {
      email: input.email,
      role_id: input.role_id,
    };
    if (input.name !== undefined) body.name = input.name;
    const result = await ctx.api.inviteUser(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
