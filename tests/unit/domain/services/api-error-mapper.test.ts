import { describe, expect, it } from "vitest";

import { mapApiError } from "../../../../src/domain/services/api-error-mapper.js";

describe("mapApiError", () => {
  it("maps unauthorized", () => {
    expect(mapApiError({ kind: "unauthorized", detail: "x" })).toEqual({
      kind: "unauthorized",
      message: "x",
    });
  });

  it("maps forbidden without code", () => {
    expect(mapApiError({ kind: "forbidden", detail: "x" })).toEqual({
      kind: "forbidden",
      message: "x",
    });
  });

  it("maps forbidden with code", () => {
    expect(mapApiError({ kind: "forbidden", detail: "x", code: "billing.suspended" })).toEqual({
      kind: "forbidden",
      message: "x",
      code: "billing.suspended",
    });
  });

  it("maps not-found", () => {
    expect(mapApiError({ kind: "not-found", detail: "missing" })).toEqual({
      kind: "not-found",
      message: "missing",
    });
  });

  it("maps rate-limited without retry", () => {
    expect(mapApiError({ kind: "rate-limited", detail: "slow down" })).toEqual({
      kind: "rate-limited",
      message: "slow down",
    });
  });

  it("maps rate-limited with retry", () => {
    expect(
      mapApiError({ kind: "rate-limited", detail: "slow down", retryAfterMs: 5000 })
    ).toEqual({ kind: "rate-limited", message: "slow down", retryAfterMs: 5000 });
  });

  it("maps invalid-input without fieldErrors", () => {
    expect(mapApiError({ kind: "invalid-input", detail: "bad" })).toEqual({
      kind: "invalid-input",
      message: "bad",
    });
  });

  it("maps invalid-input with fieldErrors", () => {
    expect(
      mapApiError({
        kind: "invalid-input",
        detail: "bad",
        fieldErrors: { url: ["required"] },
      })
    ).toEqual({
      kind: "invalid-input",
      message: "bad",
      fieldErrors: { url: ["required"] },
    });
  });

  it("maps upstream without status", () => {
    expect(mapApiError({ kind: "upstream", detail: "ECONNRESET" })).toEqual({
      kind: "upstream",
      message: "ECONNRESET",
    });
  });

  it("maps upstream with status", () => {
    expect(mapApiError({ kind: "upstream", detail: "Bad Gateway", status: 502 })).toEqual({
      kind: "upstream",
      message: "Bad Gateway",
      status: 502,
    });
  });
});
