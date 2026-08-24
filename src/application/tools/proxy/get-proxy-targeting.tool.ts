/**
 * Tool: `get_proxy_targeting` — which proxy values a scan may use.
 *
 * Wraps `GET /api/v1/proxy/targeting`. The values accepted in
 * `create_scan`'s `proxy` block come from our upstream network
 * provider's catalogue, so they cannot be an enum in the schema: they
 * differ per country and per connection type. Without this call an
 * agent has to guess, and a wrong guess is a 422.
 */

import { z } from "zod";

import type { ProxyTargetingResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetProxyTargetingInputShape = {
  country_code: z
    .string()
    .length(2)
    .describe("ISO 3166-1 alpha-2 country code, e.g. 'US'. Case-insensitive."),
  proxy_type: z
    .enum(["residential", "mobile"])
    .optional()
    .describe(
      "Which network to describe. Defaults to residential. Pass 'mobile' when the scan will use mobile: the two are separate pools with different catalogues, so a residential ISP is normally rejected for a mobile scan."
    ),
  region: z
    .string()
    .optional()
    .describe(
      "Narrow the returned cities to one region. Pass a value from this tool's own 'regions' array. Omit it for the country-wide city list."
    ),
} as const;
type GetProxyTargetingInputShape = typeof GetProxyTargetingInputShape;

export const getProxyTargetingTool: Tool<GetProxyTargetingInputShape, ProxyTargetingResponse> = {
  name: "get_proxy_targeting",
  description:
    "List the proxy regions, cities, and ISPs accepted for a country. Call this before setting proxy targeting on create_scan, create_bulk_scans, create_campaign, or update_campaign — the accepted values come from the upstream network provider and cannot be listed in those tools' schemas, so a guess is a 422. Anything listed here is accepted. Values are ordered by pool size, largest first; prefer values near the front. Two traps: residential and mobile are separate pools, so pass the proxy_type the scan will use; and without a region the cities are the whole country's, so if you target a region, call again with that region and take the city from that narrower list — a region and a city that do not belong together are accepted but leave the provider no exit node.",
  annotations: {
    title: "Get Proxy Targeting",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetProxyTargetingInputShape),
  handler: async (input, ctx): Promise<Result<ProxyTargetingResponse, ToolError>> => {
    const result = await ctx.api.getProxyTargeting({
      country_code: input.country_code,
      ...(input.proxy_type !== undefined && { proxy_type: input.proxy_type }),
      ...(input.region !== undefined && { region: input.region }),
    });
    if (result.isErr()) {
      return err(mapApiError(result.error));
    }
    return ok(result.value);
  },
};
