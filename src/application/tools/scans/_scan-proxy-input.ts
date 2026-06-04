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
      .describe("Proxy network type. Default: residential."),
    region: z.string().optional().describe("Proxy region/state targeting."),
    city: z.string().optional().describe("Proxy city targeting."),
    isp: z.string().optional().describe("Proxy ISP targeting."),
  })
  .optional()
  .describe("Optional proxy geo targeting for the crawl. Omit to use the org default.");
