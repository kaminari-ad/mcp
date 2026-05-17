/**
 * Generic parser for response envelopes that carry a single integer
 * field, e.g. `{ "queued_count": 42 }` or `{ "cancelled_count": 3 }`.
 *
 * Returns the integer wrapped in an object that uses the original
 * field name, so the caller can type the result narrowly.
 */

import type { ApiError } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

/**
 * Validates `{ [fieldName]: number }` envelopes and returns the field
 * wrapped in an object that uses the original field name (so the
 * caller can keep its strong type), or a typed `upstream` ApiError.
 *
 * The API uses this shape for one-off operation summaries (e.g.
 * `POST /scans/recheck → { queued_count }`, `POST /campaigns/{id}/cancel
 *  → { cancelled_count }`) that have no dedicated DTO. Hand-written
 * here because emitting a one-field zod schema per call site would be
 * more noise than it saves; the `check:no-handwritten-parsers` gate
 * explicitly exempts this file.
 */
export function parseIntField<TKey extends string>(
  raw: unknown,
  fieldName: TKey
): Result<Record<TKey, number>, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: `expected object with ${fieldName}` });
  }
  const value = raw[fieldName];
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return err({ kind: "upstream", detail: `${fieldName} must be an integer` });
  }
  return ok({ [fieldName]: value } as Record<TKey, number>);
}
