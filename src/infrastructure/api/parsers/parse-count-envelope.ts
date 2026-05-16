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
 *
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
