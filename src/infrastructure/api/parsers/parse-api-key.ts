/**
 * Parser for `GET /api/v1/account/api-keys` — list of API keys.
 */

import { z } from "zod";

import type { ApiError, ApiKeyResponse } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const ApiKeySchema = schemas.ApiKeyResponse.pick({
  id: true,
  key_prefix: true,
  name: true,
  expires_at: true,
  created_at: true,
}).strip();

const ApiKeyListSchema = z.array(ApiKeySchema);

export const parseApiKeyList = (raw: unknown): Result<readonly ApiKeyResponse[], ApiError> =>
  parseWithSchema(ApiKeyListSchema, raw, "api-keys");
