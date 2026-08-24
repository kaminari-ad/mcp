/**
 * Parser for `GET /api/v1/proxy/targeting` — accepted proxy targeting values.
 */

import type { ApiError, ProxyTargetingResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const ProxyTargetingSchema = schemas.ProxyTargetingResponse.pick({
  country_code: true,
  proxy_type: true,
  regions: true,
  cities: true,
  isps: true,
  refreshed_at: true,
  ttl_seconds: true,
}).strip();

export const parseProxyTargeting = (raw: unknown): Result<ProxyTargetingResponse, ApiError> =>
  parseWithSchema(ProxyTargetingSchema, raw, "proxy targeting");
