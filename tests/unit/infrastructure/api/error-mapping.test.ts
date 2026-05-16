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
});
