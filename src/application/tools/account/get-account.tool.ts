/**
 * Tool: `get_account` — wraps `GET /api/v1/account`.
 *
 * Returns the calling principal's organization (id, name, owner_id,
 * is_active, created_at). The API endpoint returns the *organization*
 * scope of the API key, not a user record — there is no separate
 * "current user" endpoint in v1. Agents typically call this first to
 * confirm they're authenticated and to capture the org id.
 */

import { z } from "zod";

import type { OrgResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetAccountInputShape = {} as const;
type GetAccountInputShape = typeof GetAccountInputShape;

export type GetAccountOutput = OrgResponse;

export const getAccountTool: Tool<GetAccountInputShape, GetAccountOutput> = {
  name: "get_account",
  description:
    "Get the organization owning the current API key (id, name, owner_id, is_active, created_at). Use this to confirm authentication and capture the org context for follow-up tool calls.",
  annotations: {
    title: "Get Account",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetAccountInputShape),
  handler: async (_input, ctx): Promise<Result<GetAccountOutput, ToolError>> => {
    const result = await ctx.api.getAccount();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
