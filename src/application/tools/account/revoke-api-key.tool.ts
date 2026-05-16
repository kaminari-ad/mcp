/**
 * Tool: `revoke_api_key` — invalidate an API key immediately.
 *
 * Destructive: any in-flight requests using the key will fail 401 on
 * the next call. Cannot be undone.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const RevokeApiKeyInputShape = {
  key_id: z.string().uuid().describe("UUID of the key to revoke (from `list_api_keys`)."),
} as const;
type RevokeApiKeyInputShape = typeof RevokeApiKeyInputShape;

export interface RevokeApiKeyOutput {
  readonly revoked: true;
}

export const revokeApiKeyTool: Tool<RevokeApiKeyInputShape, RevokeApiKeyOutput> = {
  name: "revoke_api_key",
  description:
    "Permanently invalidate an API key. Any subsequent request using it returns 401. Cannot be undone — the user would have to `create_api_key` again.",
  annotations: {
    title: "Revoke API Key",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(RevokeApiKeyInputShape),
  handler: async (input, ctx): Promise<Result<RevokeApiKeyOutput, ToolError>> => {
    const result = await ctx.api.revokeApiKey(input.key_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ revoked: true });
  },
};
