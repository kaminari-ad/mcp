/**
 * Parser for endpoints that return no body (HTTP 204 / 200 with empty
 * body). Always returns `ok(null)`.
 */

import type { ApiError } from "../../../domain/ports/api-gateway.js";
import { ok, type Result } from "../../../shared/result.js";

/**
 *
 */
export function parseEmpty(_raw: unknown): Result<null, ApiError> {
  return ok(null);
}
