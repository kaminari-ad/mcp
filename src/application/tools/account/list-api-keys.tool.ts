/**
 * Tool: `list_api_keys` — list the organization's API keys (metadata
 * only; the secret values are never returned).
 */

import { z } from "zod";

import type { ApiKeyResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListApiKeysInputShape = {} as const;
type ListApiKeysInputShape = typeof ListApiKeysInputShape;

export interface ListApiKeysOutput {
  readonly items: readonly ApiKeyResponse[];
  readonly total: number;
}

export const listApiKeysTool: Tool<ListApiKeysInputShape, ListApiKeysOutput> = {
  name: "list_api_keys",
  description:
    "List the organization's API keys: id, key prefix (first 8 chars of the secret), display name, expiry, created_at. The full secret is NEVER returned by this endpoint — only the prefix.",
  annotations: {
    title: "List Api Keys",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListApiKeysInputShape),
  handler: async (_input, ctx): Promise<Result<ListApiKeysOutput, ToolError>> => {
    const result = await ctx.api.listApiKeys();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
