/**
 * Shared zod field for scan proxy targeting.
 *
 * `create_scan` and `create_bulk_scans` both accept the same nested
 * `proxy` object (matching the API's `ProxyTargetRequest`). Defining it
 * once keeps the two tools' schemas and agent-facing descriptions in
 * sync. Every key is optional; the API fills its own defaults
 * (`proxy_type: residential`, empty region/city/isp).
 */
import { z } from "zod";

export const scanProxyField = z
  .object({
    proxy_type: z
      .enum(["residential", "mobile"])
      .optional()
      .describe(
        "Proxy network type. Default: residential. Residential and mobile are separate pools with separate catalogues, so pass the same value to `get_proxy_targeting` that you send here."
      ),
    region: z
      .string()
      .optional()
      .describe(
        "Proxy region/state. Use a value from `get_proxy_targeting`; anything else is rejected with 422."
      ),
    city: z
      .string()
      .optional()
      .describe(
        "Proxy city. Use a value from `get_proxy_targeting`. If you also set `region`, take the city from a `get_proxy_targeting` call made with that same region — a city from a different region passes validation but leaves the provider no exit node."
      ),
    isp: z
      .string()
      .optional()
      .describe(
        "Proxy ISP, or mobile carrier when `proxy_type` is mobile. Use a value from `get_proxy_targeting`."
      ),
  })
  .optional()
  .describe(
    "Optional proxy geo targeting for the crawl. Omit to use the org default. Call `get_proxy_targeting` for the country first: the accepted values come from the upstream network provider and cannot be listed in this schema."
  );
