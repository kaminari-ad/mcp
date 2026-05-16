/**
 * Pure mapping from {@link ApiError} (the gateway port's error type)
 * to {@link ToolError} (the tool-level error type).
 *
 * Lives in `domain/services/` because it encodes business knowledge
 * (how API failures translate to MCP-visible errors) and is consumed
 * by every tool handler. No I/O.
 */

import type { ApiError } from "../ports/api-gateway.js";

import type { ToolError } from "../../application/tools/_shared/tool-result.js";

/**
 * Map an API-level error to a tool-level error.
 */
export function mapApiError(apiError: ApiError): ToolError {
  switch (apiError.kind) {
    case "unauthorized":
      return { kind: "unauthorized", message: apiError.detail };
    case "forbidden":
      return apiError.code === undefined
        ? { kind: "forbidden", message: apiError.detail }
        : { kind: "forbidden", message: apiError.detail, code: apiError.code };
    case "not-found":
      return { kind: "not-found", message: apiError.detail };
    case "rate-limited":
      return apiError.retryAfterMs === undefined
        ? { kind: "rate-limited", message: apiError.detail }
        : { kind: "rate-limited", message: apiError.detail, retryAfterMs: apiError.retryAfterMs };
    case "invalid-input":
      return apiError.fieldErrors === undefined
        ? { kind: "invalid-input", message: apiError.detail }
        : { kind: "invalid-input", message: apiError.detail, fieldErrors: apiError.fieldErrors };
    case "upstream":
      return apiError.status === undefined
        ? { kind: "upstream", message: apiError.detail }
        : { kind: "upstream", message: apiError.detail, status: apiError.status };
  }
}
