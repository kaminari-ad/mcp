/**
 * Convert an HTTP response (status + parsed body) into an {@link ApiError}.
 *
 * Lives outside `http-api-gateway.ts` because it's pure (no I/O), reused
 * across every endpoint call, and benefits from independent test coverage.
 */

import type { ApiError } from "../../domain/ports/api-gateway.js";

function detail(parsed: unknown): string {
  if (parsed !== null && typeof parsed === "object" && "detail" in parsed) {
    const d = (parsed as { detail: unknown }).detail;
    if (typeof d === "string") return d;
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
