/**
 * Tool: `transfer_ownership` — hand the organization owner role to
 * another member.
 *
 * One-way: the previous owner becomes a regular member.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const TransferOwnershipInputShape = {
  user_id: z.string().uuid().describe("UUID of the existing member to become the new owner."),
} as const;
type TransferOwnershipInputShape = typeof TransferOwnershipInputShape;

export interface TransferOwnershipOutput {
  readonly transferred: true;
}

export const transferOwnershipTool: Tool<
  TransferOwnershipInputShape,
  TransferOwnershipOutput
> = {
  name: "transfer_ownership",
  description:
    "Hand the organization owner role to another existing member. ONE-WAY: the previous owner becomes a regular member afterwards. Require explicit confirmation from the user.",
  annotations: {
    title: "Transfer Organization Ownership",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(TransferOwnershipInputShape),
  handler: async (input, ctx): Promise<Result<TransferOwnershipOutput, ToolError>> => {
    const result = await ctx.api.transferOwnership(input.user_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ transferred: true });
  },
};
