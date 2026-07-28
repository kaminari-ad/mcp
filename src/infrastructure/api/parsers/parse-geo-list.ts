/**
 * Parser for `GET /api/v1/geos` — list of supported geographies.
 */

import { z } from "zod";

import type { ApiError, GeoResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const GeoSchema = schemas.GeoResponse.pick({
  country_code: true,
  name: true,
  region: true,
  tier: true,
}).strip();

const GeoListSchema = z.array(GeoSchema);

export const parseGeoList = (raw: unknown): Result<readonly GeoResponse[], ApiError> =>
  parseWithSchema(GeoListSchema, raw, "geos");
