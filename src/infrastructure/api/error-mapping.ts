/**
 * Convert an HTTP response (status + parsed body) into an {@link ApiError}.
 *
 * Lives outside `http-api-gateway.ts` because it's pure (no I/O), reused
 * across every endpoint call, and benefits from independent test coverage.
 */

import type { ApiError } from "../../domain/ports/api-gateway.js";

/**
 * Extract a human-readable error message from an API response body.
 *
 * FastAPI uses TWO shapes for the `detail` field:
 *   - String (`"Not found"` from a `HTTPException(detail=...)`)
 *   - Array of `{loc, msg, type, ...}` objects (Pydantic 422 validation)
 *
 * Both need to surface in MCP tool error output. Without the array
 * branch, EVERY 422 across every tool degrades to opaque
 * "Upstream error", which makes diagnosing missing/wrong request
 * bodies (and similar drift) impossible from the agent log alone.
 */
function detail(parsed: unknown): string {
  if (parsed === null || typeof parsed !== "object") return "Upstream error";
  if (!("detail" in parsed)) return "Upstream error";
  const d = (parsed as { detail: unknown }).detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    const messages = d
      .map((entry): string | undefined => {
        if (entry === null || typeof entry !== "object") return undefined;
        const e = entry as { loc?: unknown; msg?: unknown };
        const loc = Array.isArray(e.loc)
          ? e.loc.filter((p) => typeof p === "string").join(".")
          : "";
        const msg = typeof e.msg === "string" ? e.msg : "";
        if (loc === "" && msg === "") return undefined;
        return loc === "" ? msg : `${loc}: ${msg}`;
      })
      .filter((m): m is string => m !== undefined);
    if (messages.length > 0) return messages.join("; ");
  }
  return "Upstream error";
}

function errCode(parsed: unknown): string | undefined {
  if (parsed !== null && typeof parsed === "object" && "code" in parsed) {
    const c = (parsed as { code: unknown }).code;
    if (typeof c === "string") return c;
  }
  return undefined;
}

/**
 * Convert an HTTP `(status, parsedBody, retry-after)` tuple to a
 * typed `ApiError`. Pure — used by `HttpApiGateway.call()` after every
 * non-2xx response.
 */
export function toApiError(
  status: number,
  parsed: unknown,
  retryAfterHeader: string | string[] | undefined
): ApiError {
  const message = detail(parsed);
  if (status === 401) return { kind: "unauthorized", detail: message };
  if (status === 403) {
    const code = errCode(parsed);
    return code === undefined
      ? { kind: "forbidden", detail: message }
      : { kind: "forbidden", detail: message, code };
  }
  if (status === 404) return { kind: "not-found", detail: message };
  if (status === 422 || status === 400) return { kind: "invalid-input", detail: message };
  if (status === 429) {
    const ra = Array.isArray(retryAfterHeader) ? retryAfterHeader[0] : retryAfterHeader;
    const retryMs = ra === undefined ? undefined : Number.parseInt(ra, 10) * 1000;
    return retryMs === undefined || Number.isNaN(retryMs)
      ? { kind: "rate-limited", detail: message }
      : { kind: "rate-limited", detail: message, retryAfterMs: retryMs };
  }
  return { kind: "upstream", detail: message, status };
}
