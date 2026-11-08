import { gzipSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import type { CapturedResourceBody } from "../../../../../src/domain/ports/api-gateway.js";
import { walkResourceBodies } from "../../../../../src/infrastructure/api/parsers/parse-resource-bodies.js";

const CAP = 1024 * 1024;

const row = (url: string, extra: object = { body: "x" }) =>
  JSON.stringify({ url, resource_type: "script", content_type: "", size: 1, ...extra });

async function walk(gz: Uint8Array, cap = CAP, stopAt?: number) {
  const rows: CapturedResourceBody[] = [];
  const result = await walkResourceBodies(gz, cap, (r) => {
    rows.push(r);
    return r.index !== stopAt;
  });
  return { result, rows };
}

describe("walkResourceBodies", () => {
  it("numbers rows in artifact order, skipping blank lines", async () => {
    const gz = gzipSync(`${row("a")}\n\n${row("b", { skipped: "budget" })}\n`);

    const { result, rows } = await walk(gz);

    expect(result.isOk()).toBe(true);
    expect(rows.map((r) => [r.index, r.url, r.body, r.skipped])).toEqual([
      [0, "a", "x", null],
      [1, "b", null, "budget"],
    ]);
  });

  it("joins a row that spans several decompressed chunks", async () => {
    const big = "y".repeat(300_000);
    const { rows } = await walk(gzipSync(`${row("a", { body: big })}\n${row("b")}`));

    expect(rows.map((r) => [r.url, r.body?.length])).toEqual([
      ["a", 300_000],
      ["b", 1],
    ]);
  });

  it("stops reading once the visitor has its row", async () => {
    const { result, rows } = await walk(gzipSync(`${row("a")}\n${row("b")}\n{oops`), CAP, 1);

    expect(result.isOk()).toBe(true);
    expect(rows.map((r) => r.url)).toEqual(["a", "b"]);
  });

  it("keeps multi-byte bodies intact", async () => {
    const { rows } = await walk(gzipSync(row("a", { body: "Скидка 90%" })));

    expect(rows[0]?.body).toBe("Скидка 90%");
  });

  it("refuses contents that decompress past the cap", async () => {
    const { result } = await walk(gzipSync(row("a", { body: "y".repeat(200_000) })), 64 * 1024);

    expect(result._unsafeUnwrapErr().detail).toContain("64.0 KiB");
  });

  it("rejects a line that is not JSON", async () => {
    const { result } = await walk(gzipSync(`${row("a")}\n{oops`));

    expect(result._unsafeUnwrapErr().detail).toBe("malformed resource row 1");
  });

  it("rejects a row that breaks mid-archive", async () => {
    const { result, rows } = await walk(gzipSync(`{"url": 1}\n${row("b")}`));

    expect(result._unsafeUnwrapErr().detail).toBe("malformed resource row 0");
    expect(rows).toEqual([]);
  });

  it("reports bytes that are not gzip", async () => {
    const { result } = await walk(Buffer.from("not gzip"));

    expect(result._unsafeUnwrapErr().detail).toBe("Captured contents are not a valid gzip file.");
  });
});
