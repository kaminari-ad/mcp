/**
 * Parser for `GET /api/v1/runs/{id}` and the run-shape that
 * `POST /api/v1/campaigns/{id}/run` returns.
 */

import type { ApiError, RunResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const RunSchema = schemas.RunResponse.pick({
  id: true,
  campaign_id: true,
  label: true,
  total: true,
  completed: true,
  failed: true,
  partial: true,
  cancelled: true,
  source: true,
  created_at: true,
}).strip();

export const parseRun = (raw: unknown): Result<RunResponse, ApiError> =>
  parseWithSchema(RunSchema, raw, "run") as Result<RunResponse, ApiError>;
