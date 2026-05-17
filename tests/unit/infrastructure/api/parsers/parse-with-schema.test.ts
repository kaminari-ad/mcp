import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  parseArrayOrItemsWithSchema,
  parsePagedWithItemSchema,
  parseWithSchema,
} from "../../../../../src/infrastructure/api/parsers/parse-with-schema.js";

describe("parseWithSchema", () => {
  const Schema = z
    .object({
      id: z.string(),
      name: z.string(),
      maybe: z.string().optional(),
    })
    .strip();

  it("returns Ok on a valid payload", () => {
    const r = parseWithSchema(Schema, { id: "x", name: "n", maybe: "m" }, "thing");
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ id: "x", name: "n", maybe: "m" });
  });

  it("strips runtime keys whose value is exactly `undefined`", () => {
    // Zod's `.optional()` decoder emits `{ maybe: undefined }` for
    // absent fields when the underlying spec marked them with a
    // default. Port DTOs use `?:` style (exactOptionalPropertyTypes)
    // which does NOT accept explicit undefined — strip it.
    const r = parseWithSchema(Schema, { id: "x", name: "n" }, "thing");
    expect(r.isOk()).toBe(true);
    expect(Object.keys(r._unsafeUnwrap())).toEqual(["id", "name"]);
  });

  it("strips undefined recursively (inside arrays + nested objects)", () => {
    const Nested = z
      .object({
        items: z.array(z.object({ a: z.string(), b: z.string().optional() })),
        nested: z.object({ x: z.string(), y: z.string().optional() }),
      })
      .strip();
    const r = parseWithSchema(Nested, { items: [{ a: "1" }], nested: { x: "x" } }, "nested");
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(Object.keys(v.items[0] ?? {})).toEqual(["a"]);
    expect(Object.keys(v.nested)).toEqual(["x"]);
  });

  it("returns Err with field path on missing required key", () => {
    const r = parseWithSchema(Schema, { name: "n" }, "thing");
    expect(r.isErr()).toBe(true);
    const e = r._unsafeUnwrapErr();
    expect(e.kind).toBe("upstream");
    expect(e.detail).toContain("malformed thing");
    expect(e.detail).toContain("id");
  });

  it("returns Err on non-object body", () => {
    const r = parseWithSchema(Schema, "not-an-object", "thing");
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().detail).toContain("malformed thing");
  });

  it("returns Err with `validation failed` fallback when zod gives no message", () => {
    // Schema that throws an error with no usable issue message.
    const empty = z.never();
    const r = parseWithSchema(empty, "anything", "thing");
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().kind).toBe("upstream");
  });

  it("uses the no-path branch when zod issue path is empty", () => {
    // `z.string()` at the top level produces an issue with empty
    // `path` array — exercises the `path === ""` ternary branch.
    const r = parseWithSchema(z.string(), 42, "value");
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().detail).toMatch(/^malformed value: /);
    expect(r._unsafeUnwrapErr().detail).not.toContain(": :");
  });

  it("strip helper handles explicit undefined inside passthrough payload", () => {
    // `.passthrough()` keeps unknown keys including ones with an
    // explicit `undefined` value (e.g. an upstream proxy that forwards
    // a JSON `null`-was-coerced-to-undefined field). The stripper's
    // `if (v === undefined) continue;` branch covers this case.
    const Loose = z.object({ id: z.string() }).passthrough();
    const r = parseWithSchema(Loose, { id: "x", extra: undefined }, "loose");
    expect(r.isOk()).toBe(true);
    expect(Object.keys(r._unsafeUnwrap())).toEqual(["id"]);
  });
});

describe("parsePagedWithItemSchema", () => {
  const Item = z.object({ id: z.string() }).strip();

  it("Ok on standard FastAPI envelope (passes through `pages` extra)", () => {
    const r = parsePagedWithItemSchema(
      Item,
      { items: [{ id: "a" }, { id: "b" }], total: 2, page: 1, limit: 10, pages: 1 },
      "thing"
    );
    expect(r.isOk()).toBe(true);
    // `pages` is preserved at runtime via `.passthrough()` on the
    // envelope — the TS type narrows to the four declared fields but
    // the parsed object keeps any extra keys the API sends.
    expect(r._unsafeUnwrap()).toMatchObject({
      items: [{ id: "a" }, { id: "b" }],
      total: 2,
      page: 1,
      limit: 10,
    });
  });

  it("Err on missing envelope fields", () => {
    expect(parsePagedWithItemSchema(Item, { items: [], total: 0 }, "thing").isErr()).toBe(true);
  });

  it("Err on malformed items", () => {
    expect(
      parsePagedWithItemSchema(
        Item,
        { items: [{ wrong: "shape" }], total: 1, page: 1, limit: 10 },
        "thing"
      ).isErr()
    ).toBe(true);
  });
});

describe("parseArrayOrItemsWithSchema", () => {
  const Item = z.object({ id: z.string() }).strip();

  it("Ok on bare array", () => {
    const r = parseArrayOrItemsWithSchema(Item, [{ id: "x" }, { id: "y" }], "thing");
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual([{ id: "x" }, { id: "y" }]);
  });

  it("Ok on envelope (unwraps items)", () => {
    const r = parseArrayOrItemsWithSchema(
      Item,
      { items: [{ id: "x" }], total: 1, page: 1, limit: 50 },
      "thing"
    );
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual([{ id: "x" }]);
  });

  it("Err on garbage (neither array nor envelope)", () => {
    expect(parseArrayOrItemsWithSchema(Item, 42, "thing").isErr()).toBe(true);
    expect(parseArrayOrItemsWithSchema(Item, { not: "items" }, "thing").isErr()).toBe(true);
    expect(parseArrayOrItemsWithSchema(Item, { items: "not-array" }, "thing").isErr()).toBe(true);
  });

  it("Err when an item is malformed", () => {
    expect(parseArrayOrItemsWithSchema(Item, [{ wrong: "shape" }], "thing").isErr()).toBe(true);
  });
});
