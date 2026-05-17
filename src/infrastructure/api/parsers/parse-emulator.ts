/**
 * Parser for `GET /api/v1/emulators` — list of available emulators.
 */

import { z } from "zod";

import type { ApiError, EmulatorResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const EmulatorSchema = schemas.EmulatorResponse.pick({
  id: true,
  display_name: true,
  category: true,
  browser: true,
}).strip();

const EmulatorListSchema = z.array(EmulatorSchema);

export const parseEmulatorList = (raw: unknown): Result<readonly EmulatorResponse[], ApiError> =>
  parseWithSchema(EmulatorListSchema, raw, "emulators") as Result<
    readonly EmulatorResponse[],
    ApiError
  >;
