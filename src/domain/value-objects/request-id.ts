/**
 * Per-incoming-request correlation ID. UUID v4 (Node `randomUUID`).
 *
 * Used as the `request_id` log field and propagated to the API as
 * `X-Request-Id` so a single user action can be traced across MCP and
 * the API.
 *
 * Branded string so it cannot be confused with a `tool_name`, a
 * `session_id`, or any other identifier the codebase passes around.
 */

import { randomUUID } from "node:crypto";

declare const requestIdBrand: unique symbol;

export type RequestId = string & { readonly [requestIdBrand]: never };

/**
 * Generates a fresh {@link RequestId}.
 */
export function newRequestId(): RequestId {
  return randomUUID() as RequestId;
}

/**
 * Wraps an externally-supplied UUID string as a {@link RequestId}.
 * Returns `undefined` if the input is not a v4-ish UUID.
 */
export function parseRequestId(raw: string): RequestId | undefined {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
    ? (raw as RequestId)
    : undefined;
}
