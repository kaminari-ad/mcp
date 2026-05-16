/**
 * Tool: `list_geos` — every country the Kaminari Ad platform can scan from.
 *
 * Wraps `GET /api/v1/geos`. Useful for an agent that wants to choose a
 * valid `country_code` before calling `create_scan`. Cheap call, no
 * pagination — the full list is ~250 entries.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { GeoResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListGeosInputShape = {} as const;
type ListGeosInputShape = typeof ListGeosInputShape;

export interface ListGeosOutput {
  readonly items: readonly GeoResponse[];
  readonly total: number;
}

export const listGeosTool: Tool<ListGeosInputShape, ListGeosOutput> = {
  name: "list_geos",
  description:
        "List every country the Kaminari Ad platform can scan ads from, with ISO 3166-1 alpha-2 code, name, continent, and emoji.",
      annotations: { title: "List Geos", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: z.object(ListGeosInputShape),
  handler: async (_input, ctx): Promise<Result<ListGeosOutput, ToolError>> => {
    const result = await ctx.api.listGeos();
    if (result.isErr()) {
      return err(mapApiError(result.error));
    }
    return ok({ items: result.value, total: result.value.length });
  },
};
