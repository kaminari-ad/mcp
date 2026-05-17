/**
 * Parser for endpoints that return no body (HTTP 204 / 200 with empty
 * body). Always returns `ok(null)`.
 */

import type { ApiError } from "../../../domain/ports/api-gateway.js";
import { ok, type Result } from "../../../shared/result.js";

/**
 * Parser for `204 No Content` responses. Ignores the input (which is
 * `null` for a successful empty body, or whatever undici left in `data`)
 * and always returns `Ok(null)`. Used by every mutator that the API
 * answers without echoing the entity back — see e.g. `removeUser`,
 * `revokeApiKey`, `requestPolicySetApproval`, `setAlertDestinationVersion`.
 */
export function parseEmpty(_raw: unknown): Result<null, ApiError> {
  return ok(null);
}
