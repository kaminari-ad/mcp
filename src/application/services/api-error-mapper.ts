/**
 * Pure mapping from {@link ApiError} (the gateway port's error type)
 * to {@link ToolError} (the tool-level error type).
 *
 * Lives in `application/services/` because `ToolError` is an
 * application-layer concept; mapping infrastructure-shaped errors
 * (`ApiError` carries upstream HTTP status, etc.) into the tool
 * vocabulary is exactly the application layer's job. No I/O.
 */

import type { ApiError } from "../../domain/ports/api-gateway.js";
import type { ToolError } from "../tools/_shared/tool-result.js";

/** Map an API-level error to a tool-level error. */
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
