import { describe, expect, it } from "vitest";

import { toApiError } from "../../../../src/infrastructure/api/error-mapping.js";

describe("toApiError", () => {
  it("401 -> unauthorized", () => {
    expect(toApiError(401, { detail: "x" }, undefined)).toEqual({
      kind: "unauthorized",
      detail: "x",
    });
  });

  it("403 with code", () => {
    expect(toApiError(403, { detail: "x", code: "billing.suspended" }, undefined)).toEqual({
      kind: "forbidden",
      detail: "x",
      code: "billing.suspended",
    });
  });

  it("403 without code", () => {
    expect(toApiError(403, { detail: "x" }, undefined)).toEqual({
      kind: "forbidden",
      detail: "x",
    });
  });

  it("404", () => {
    expect(toApiError(404, { detail: "x" }, undefined)).toEqual({
      kind: "not-found",
      detail: "x",
    });
  });

  it("422 -> invalid-input", () => {
    expect(toApiError(422, { detail: "bad" }, undefined)).toMatchObject({
      kind: "invalid-input",
    });
  });

  it("400 -> invalid-input", () => {
    expect(toApiError(400, { detail: "bad" }, undefined)).toMatchObject({
      kind: "invalid-input",
    });
  });

  it("429 with numeric Retry-After", () => {
    expect(toApiError(429, { detail: "slow" }, "30")).toEqual({
      kind: "rate-limited",
      detail: "slow",
      retryAfterMs: 30_000,
    });
  });

  it("429 with array Retry-After (takes first)", () => {
    expect(toApiError(429, { detail: "slow" }, ["10", "20"])).toEqual({
      kind: "rate-limited",
      detail: "slow",
      retryAfterMs: 10_000,
    });
  });

  it("429 without Retry-After", () => {
    expect(toApiError(429, { detail: "slow" }, undefined)).toEqual({
      kind: "rate-limited",
      detail: "slow",
    });
  });

  it("429 with non-numeric Retry-After", () => {
    expect(toApiError(429, { detail: "slow" }, "now")).toEqual({
      kind: "rate-limited",
      detail: "slow",
    });
  });

  it("503 -> upstream with status", () => {
    expect(toApiError(503, { detail: "down" }, undefined)).toEqual({
      kind: "upstream",
      detail: "down",
      status: 503,
    });
  });

  it("missing body falls back to 'Upstream error'", () => {
    expect(toApiError(500, undefined, undefined)).toEqual({
      kind: "upstream",
      detail: "Upstream error",
      status: 500,
    });
  });

  it("ignores non-string code field", () => {
    expect(toApiError(403, { detail: "x", code: 42 }, undefined)).toEqual({
      kind: "forbidden",
      detail: "x",
    });
  });

  describe("FastAPI 422 array-shaped detail", () => {
    it("formats single entry as `<loc>: <msg>`", () => {
      const body = {
        detail: [
          {
            type: "missing",
            loc: ["body", "event_type"],
            msg: "Field required",
            input: null,
          },
        ],
      };
      expect(toApiError(422, body, undefined)).toEqual({
        kind: "invalid-input",
        detail: "body.event_type: Field required",
      });
    });

    it("joins multiple entries with `; `", () => {
      const body = {
        detail: [
          { type: "missing", loc: ["body", "event_type"], msg: "Field required" },
          { type: "string_type", loc: ["body", "url"], msg: "Input should be a valid string" },
        ],
      };
      expect(toApiError(422, body, undefined).detail).toBe(
        "body.event_type: Field required; body.url: Input should be a valid string"
      );
    });

    it("falls back to `<msg>` when loc is missing", () => {
      const body = { detail: [{ msg: "something failed" }] };
      expect(toApiError(422, body, undefined).detail).toBe("something failed");
    });

    it("skips entries with neither loc nor msg", () => {
      const body = {
        detail: [{ msg: "kept" }, { type: "noise" }, { loc: ["body", "x"], msg: "also kept" }],
      };
      expect(toApiError(422, body, undefined).detail).toBe("kept; body.x: also kept");
    });

    it("falls back to 'Upstream error' when detail array has no usable entries", () => {
      expect(toApiError(422, { detail: [{ type: "noise" }] }, undefined).detail).toBe(
        "Upstream error"
      );
    });

    it("filters non-string parts out of `loc`", () => {
      const body = { detail: [{ loc: ["body", 0, "x"], msg: "bad" }] };
      // Integer parts (array indices) are dropped; only string parts are joined.
      expect(toApiError(422, body, undefined).detail).toBe("body.x: bad");
    });

    it("skips null / non-object array entries", () => {
      // Defensive — Pydantic always sends `{loc, msg, ...}` objects,
      // but a buggy middleware between us and the API could mangle
      // the array. Don't blow up; just keep the usable entries.
      const body = { detail: [null, "raw-string", 42, { msg: "kept" }] };
      expect(toApiError(422, body, undefined).detail).toBe("kept");
    });
  });
});
