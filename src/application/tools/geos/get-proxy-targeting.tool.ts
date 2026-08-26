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
    "List the proxy regions, cities and ISPs available for a country, ordered by pool size. Anything this returns is accepted in the `proxy` block of create_scan; anything else is rejected with a 422. Call it before scanning with proxy targeting rather than guessing. `refreshed_at` is when we last checked with the network provider and moves on every check, so it is not a change signal on its own.",
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
