/**
 * Decoder for `GET /api/v1/scans/{id}/[creative-|landings/{ord}/]resource-bodies`:
 * the crawler's gzip-compressed JSON Lines, one captured resource per line.
 *
 * Walked line by line so a caller keeps only what it needs — the listing
 * drops every body, the body read keeps one — instead of holding every
 * script of the surface as a string at once.
 *
 * Hand-written on purpose: the rows live inside an `application/gzip`
 * body, which the OpenAPI spec describes as bytes, so there is no
 * generated schema to project.
 */

import { promisify } from "node:util";
import { gunzip } from "node:zlib";

import { z } from "zod";

import type { ApiError, CapturedResourceBody } from "../../../domain/ports/api-gateway.js";
import { formatBytes } from "../../../shared/artifact-limits.js";
import { err, ok, type Result } from "../../../shared/result.js";

const gunzipAsync = promisify(gunzip);

const NEWLINE = 0x0a;

const RowSchema = z.object({
  url: z.string(),
  resource_type: z.string(),
  content_type: z.string(),
  size: z.number().int(),
  body: z.string().optional(),
  skipped: z.string().optional(),
});

async function decompress(gz: Uint8Array, maxBytes: number): Promise<Result<Buffer, ApiError>> {
  try {
    return ok(await gunzipAsync(gz, { maxOutputLength: maxBytes }));
  } catch (cause) {
    const tooLarge = cause instanceof RangeError;
    return err({
      kind: "upstream",
      detail: tooLarge
        ? `Captured contents exceed the ${formatBytes(maxBytes)} this tool will read.`
        : "Captured contents are not a valid gzip file.",
    });
  }
}

function parseRow(text: string, index: number): Result<CapturedResourceBody, ApiError> {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return err({ kind: "upstream", detail: `malformed resource row ${String(index)}` });
  }
  const parsed = RowSchema.safeParse(raw);
  if (!parsed.success) {
    return err({ kind: "upstream", detail: `malformed resource row ${String(index)}` });
  }
  const row = parsed.data;
  return ok({
    index,
    url: row.url,
    resource_type: row.resource_type,
    content_type: row.content_type,
    size: row.size,
    skipped: row.skipped ?? null,
    body: row.body ?? null,
  });
}

/**
 * Decompress *gz* and hand each row to *visit* in artifact order.
 * Empty lines are not rows, so `index` matches the API's line numbering.
 */
export async function walkResourceBodies(
  gz: Uint8Array,
  maxBytes: number,
  visit: (row: CapturedResourceBody) => void
): Promise<Result<null, ApiError>> {
  const decoded = await decompress(gz, maxBytes);
  if (decoded.isErr()) return err(decoded.error);
  const buf = decoded.value;
  let index = 0;
  let start = 0;
  while (start < buf.length) {
    const newline = buf.indexOf(NEWLINE, start);
    const end = newline === -1 ? buf.length : newline;
    const text = buf.toString("utf8", start, end).trim();
    start = end + 1;
    if (text === "") continue;
    const row = parseRow(text, index);
    if (row.isErr()) return err(row.error);
    visit(row.value);
    index += 1;
  }
  return ok(null);
}
