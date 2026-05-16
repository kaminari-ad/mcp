import { describe, expect, it } from "vitest";

import { createNoopErrorReporter } from "../../../../src/infrastructure/error-reporting/noop-error-reporter.js";

describe("NoopErrorReporter", () => {
  it("capture() returns void and does not throw", () => {
    const reporter = createNoopErrorReporter();
    expect(reporter.capture(new Error("x"))).toBeUndefined();
    expect(reporter.capture("string error", { request_id: "abc" })).toBeUndefined();
  });
});
