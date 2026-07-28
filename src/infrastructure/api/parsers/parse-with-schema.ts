/**
 * Shared helper that validates an unknown JSON body against a zod
 * schema (the canonical source of truth, generated from openapi.ts
 * via `npm run gen:api-types` — see `src/shared/api/zod-schemas.ts`).
 *
 * Every per-endpoint parser is now a one-liner that calls into this
 * helper with `schemas.X.pick({...})` for the fields the MCP port
 * actually exposes. If the API drops or renames a field, the schema
 * regen surfaces it as a TS error at the parser site; if the
 * production payload disagrees with the schema at runtime, the agent
 * sees a typed `Upstream` MCP error with the zod issue message
 * instead of a runtime `undefined.id` crash.
 */

import { z } from "zod";

import type { ApiError } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

/**
 * Validate `raw` against `schema`; on success return `Ok(data)`,
 * on failure return a typed upstream `ApiError` whose detail string
 * carries the zod issue message verbatim.
 *
 * `label` is the bounded-context noun ("campaign", "policy-set",
 * "webhook") — used to produce a readable error like
 * `"malformed campaign: Expected string, received null"`.
 */
export function parseWithSchema<S extends z.ZodTypeAny>(
  schema: S,
  raw: unknown,
  label: string
): Result<z.infer<S>, ApiError> {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return ok(stripUndefinedKeys(parsed.data) as z.infer<S>);
  const first = parsed.error.issues[0];
  const path = first?.path.join(".") ?? "";
  const message = first?.message ?? "validation failed";
  const detail =
    path === "" ? `malformed ${label}: ${message}` : `malformed ${label}: ${path}: ${message}`;
  return err({ kind: "upstream", detail });
}

/**
 * Walk a parsed object and drop keys whose value is exactly
 * `undefined`. Zod's `.optional()` decoder emits explicit
 * `{ key: undefined }` for absent fields when the underlying
 * OpenAPI schema marked them with `default: []` (or similar).
 * Port DTOs use openapi-typescript's `?:` style which under
 * `exactOptionalPropertyTypes: true` means "the key may be ABSENT
 * or present with the declared type" — explicitly `undefined` is
 * NOT acceptable. Strip the undefined keys to match.
 */
function stripUndefinedKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUndefinedKeys);
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (v === undefined) continue;
    out[k] = stripUndefinedKeys(v);
  }
  return out;
}

/**
 * Validate a paginated envelope shaped as
 * `{ items: T[], total, page, limit, pages? }` and return the
 * canonical {@link PaginatedResponse} the MCP port exposes (drops
 * the `pages` field — agents don't need it; total + limit is enough
 * to derive page count when relevant).
 */
export function parsePagedWithItemSchema<S extends z.ZodTypeAny>(
  itemSchema: S,
  raw: unknown,
  label: string
): Result<
  {
    readonly items: readonly z.infer<S>[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
  },
  ApiError
> {
  const envelope = z
    .object({
      items: z.array(itemSchema),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
    })
    .passthrough();
  return parseWithSchema(envelope, raw, `${label} page`);
}

/**
 * Validate either a bare `T[]` or a paginated envelope `{ items: T[], … }`
 * and return the inner array. Defensive — used for list endpoints whose
 * OpenAPI contract is currently bare-array but might gain envelope
 * wrapping in a future API release (and vice-versa). Matches the
 * `unwrapItems` pattern from `parsePolicySetList`.
 */
export function parseArrayOrItemsWithSchema<S extends z.ZodTypeAny>(
  itemSchema: S,
  raw: unknown,
  label: string
): Result<readonly z.infer<S>[], ApiError> {
  if (Array.isArray(raw)) {
    return parseWithSchema(z.array(itemSchema), raw, label);
  }
  if (raw !== null && typeof raw === "object" && "items" in raw) {
    const items = raw.items;
    return parseWithSchema(z.array(itemSchema), items, label);
  }
  return err({
    kind: "upstream",
    detail: `expected array (or {items:[]}) of ${label}`,
  });
}
