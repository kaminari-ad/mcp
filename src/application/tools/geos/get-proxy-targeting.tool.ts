/**
 * Tool: `get_proxy_targeting` — the region / city / ISP values a scan's
 * `proxy` block may use for a country.
 *
 * Wraps `GET /api/v1/proxy/targeting`. The catalogue comes from our
 * upstream network provider, so it cannot be a fixed enum in the scan
 * schema — without this call an agent has to guess and eat a 422.
 */

import { z } from "zod";

import type { ProxyTargetingResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetProxyTargetingInputShape = {
  country_code: z.string().length(2).describe("ISO 3166-1 alpha-2 country code. Case-insensitive."),
  proxy_type: z
    .enum(["residential", "mobile"])
    .optional()
    .describe(
      "Which network to describe. Pass it explicitly: the residential and mobile catalogues differ substantially — in the US that is 1500+ ISPs against roughly a dozen carriers — so a value taken from one is often rejected for the other."
    ),
  region: z
    .string()
    .optional()
    .describe(
      "Narrow `cities` to one region. Omit for the country-wide city list. Pass a value from this endpoint's own `regions` array."
    ),
} as const;
type GetProxyTargetingInputShape = typeof GetProxyTargetingInputShape;

export type GetProxyTargetingOutput = ProxyTargetingResponse;

export const getProxyTargetingTool: Tool<GetProxyTargetingInputShape, GetProxyTargetingOutput> = {
  name: "get_proxy_targeting",
  description:
    "List the proxy regions, cities and ISPs available for a country, ordered by pool size. Anything this returns passes validation in the `proxy` block of create_scan; anything else is rejected with a 422. Call it before scanning with proxy targeting rather than guessing. Read `refreshed_at` before trusting empty arrays: `null` means we have not synced this country yet, so the empty lists are not an answer and the call is worth retrying, whereas empty lists WITH a timestamp mean no targeting is available there. Passing validation is not a delivery guarantee — the provider's pool moves, so a narrowly targeted scan can still find no exit node at crawl time.",
  annotations: {
    title: "Get Proxy Targeting",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetProxyTargetingInputShape),
  handler: async (input, ctx): Promise<Result<GetProxyTargetingOutput, ToolError>> => {
    const filters = {
      country_code: input.country_code,
      ...(input.proxy_type !== undefined ? { proxy_type: input.proxy_type } : {}),
      ...(input.region !== undefined ? { region: input.region } : {}),
    };
    const result = await ctx.api.getProxyTargeting(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
