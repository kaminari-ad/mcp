/**
 * Decoder for `GET /api/v1/scans/{id}/[creative-|landings/{ord}/]resource-bodies`:
 * the crawler's gzip-compressed JSON Lines, one captured resource per line.
 *
 * Streamed: the archive is decompressed chunk by chunk and handed over one
 * row at a time, so memory holds a single line rather than the whole
 * surface, and a caller that found its row stops the walk there.
 *
 * Hand-written on purpose: the rows live inside an `application/gzip`
 * body, which the OpenAPI spec describes as bytes, so there is no
 * generated schema to project.
 */

import { createGunzip } from "node:zlib";

import { z } from "zod";

import type { ApiError, CapturedResourceBody } from "../../../domain/ports/api-gateway.js";
import { formatBytes } from "../../../shared/artifact-limits.js";
import { err, ok, type Result } from "../../../shared/result.js";

const NEWLINE = 0x0a;

const RowSchema = z.object({
  url: z.string(),
  resource_type: z.string(),
  content_type: z.string(),
  size: z.number().int(),
  body: z.string().optional(),
  skipped: z.string().optional(),
});

/** Visitor result: `true` to keep walking, `false` once the caller has what it needs. */
export type RowVisitor = (row: CapturedResourceBody) => boolean;

function parseRow(text: string, index: number): Result<CapturedResourceBody, ApiError> {
  const malformed = err<CapturedResourceBody, ApiError>({
    kind: "upstream",
    detail: `malformed resource row ${String(index)}`,
  });
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return malformed;
  }
  const parsed = RowSchema.safeParse(raw);
  if (!parsed.success) return malformed;
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

/** Splits decompressed chunks into lines and feeds the non-blank ones to a visitor. */
class LineFeeder {
  private pending: Buffer[] = [];
  private index = 0;

  constructor(private readonly visit: RowVisitor) {}

  /** Feed one chunk; `ok(false)` means the visitor asked to stop. */
  push(chunk: Buffer): Result<boolean, ApiError> {
    let start = 0;
    for (;;) {
      const newline = chunk.indexOf(NEWLINE, start);
      if (newline === -1) break;
      this.pending.push(chunk.subarray(start, newline));
      start = newline + 1;
      const fed = this.flush();
      if (fed.isErr() || !fed.value) return fed;
    }
    if (start < chunk.length) this.pending.push(chunk.subarray(start));
    return ok(true);
  }

  /** Emit whatever is buffered as one line. */
  flush(): Result<boolean, ApiError> {
    const text = Buffer.concat(this.pending).toString("utf8").trim();
    this.pending = [];
    if (text === "") return ok(true);
    const row = parseRow(text, this.index);
    if (row.isErr()) return err(row.error);
    this.index += 1;
    return ok(this.visit(row.value));
  }
}

/**
 * Decompress *gz* and hand each row to *visit* in artifact order until it
 * returns `false`. Empty lines are not rows, so `index` matches the API's
 * line numbering. More than *maxBytes* of decompressed data is refused.
 */
export async function walkResourceBodies(
  gz: Uint8Array,
  maxBytes: number,
  visit: RowVisitor
): Promise<Result<null, ApiError>> {
  const gunzip = createGunzip();
  gunzip.end(gz);
  const feeder = new LineFeeder(visit);
  let decoded = 0;
  try {
    for await (const chunk of gunzip as AsyncIterable<Buffer>) {
      decoded += chunk.length;
      if (decoded > maxBytes) {
        return err({
          kind: "upstream",
          detail: `Captured contents exceed the ${formatBytes(maxBytes)} this tool will read.`,
        });
      }
      const fed = feeder.push(chunk);
      if (fed.isErr()) return err(fed.error);
      if (!fed.value) return ok(null);
    }
  } catch {
    return err({ kind: "upstream", detail: "Captured contents are not a valid gzip file." });
  } finally {
    gunzip.destroy();
  }
  const last = feeder.flush();
  return last.isErr() ? err(last.error) : ok(null);
}
