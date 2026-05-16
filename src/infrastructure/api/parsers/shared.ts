/**
 * Tiny parser primitives shared across the per-endpoint parsers.
 *
 * Kept here rather than next to one parser because they belong to
 * every parser — putting them in one file makes their reuse explicit.
 */

/**
 *
 */
export function isStringRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
