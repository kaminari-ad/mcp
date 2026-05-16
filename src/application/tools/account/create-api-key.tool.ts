/**
 * Tool: `create_api_key` — mint a new API key.
 *
 * The full secret is returned ONCE in the `full_key` field. After that
 * the server stores only the hash. Display it to the user and tell
 * them to save it; we cannot recover it.
 */

import { z } from "zod";

import type { ApiKeyCreatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const CreateApiKeyInputShape = {
  name: z
    .string()
    .min(1)
    .max(100)
    .describe("Human-readable label (e.g. `ci-pipeline`, `claude-mcp`)."),
  expires_at: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Optional ISO-8601 expiry timestamp. Omit for a non-expiring key (operator can revoke any time)."
    ),
} as const;
type CreateApiKeyInputShape = typeof CreateApiKeyInputShape;

export type CreateApiKeyOutput = ApiKeyCreatedResponse;

export const createApiKeyTool: Tool<CreateApiKeyInputShape, CreateApiKeyOutput> = {
  name: "create_api_key",
  description:
    "Mint a new API key for the caller's organization. The full secret is returned in `full_key` THIS ONE TIME ONLY — show it to the user and instruct them to store it; the server keeps only a hash and cannot reveal it again.",
  annotations: {
    title: "Create API Key",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  inputSchema: z.object(CreateApiKeyInputShape),
  handler: async (input, ctx): Promise<Result<CreateApiKeyOutput, ToolError>> => {
    const body = {
      name: input.name,
      ...(input.expires_at !== undefined ? { expires_at: input.expires_at } : {}),
    };
    const result = await ctx.api.createApiKey(body);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
