/**
 * Tool: `get_me` — the reference tool for Phase 2.
 *
 * Wraps `GET /api/v1/account`. Returns the calling principal's
 * identity (user_id, organization_id, email, display name, granted
 * permissions). Useful for an agent to confirm "who am I" at the start
 * of a session.
 *
 * Demonstrates the canonical tool pattern; every other tool added in
 * Phase 4 follows this same shape.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { MeResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetMeInputShape = {} as const;
type GetMeInputShape = typeof GetMeInputShape;

/**
 * Output mirrors {@link MeResponse} verbatim. Kept as a separate alias
 * so a future renamed-field rollout can decouple the API shape from
 * what the tool exposes.
 */
export type GetMeOutput = MeResponse;

/**
 * The `get_me` MCP tool.
 */
export const getMeTool: Tool<GetMeInputShape, GetMeOutput> = {
  name: "get_me",
  description:
        "Get the authenticated user and organization for the current API key, including the granted permission set.",
      annotations: { title: "Get Me", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(GetMeInputShape),
  handler: async (_input, ctx): Promise<Result<GetMeOutput, ToolError>> => {
    const result = await ctx.api.getMe();
    if (result.isErr()) {
      return err(mapApiError(result.error));
    }
    return ok(result.value);
  },
};
