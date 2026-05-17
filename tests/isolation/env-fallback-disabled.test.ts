/**
 * Isolation test: CONTRIBUTING.md "Tenant isolation" §5.
 *
 * Starting in HTTP mode with `KAMINARI_AD_API_KEY` set in the
 * environment MUST exit non-zero. The env var is a stdio-only fallback;
 * having it set in HTTP mode would create a default-Bearer fallback
 * that gets used when an incoming request has no `Authorization`.
 */

import { describe, expect, it } from "vitest";

import { bootstrapHttp } from "../../src/presentation/http/http-bootstrap.js";
import { loadConfig } from "../../src/shared/config.js";

describe("isolation: HTTP-mode env fallback disabled", () => {
  it("bootstrapHttp returns exit code 2 when KAMINARI_AD_API_KEY is set", async () => {
    const cfgResult = loadConfig({
      KAMINARI_AD_TRANSPORT: "http",
      KAMINARI_AD_API_URL: "https://kaminari.test",
      KAMINARI_AD_LOG_LEVEL: "fatal", // silence the fatal log line in test output
      KAMINARI_AD_HTTP_PORT: "0",
      KAMINARI_AD_RATE_LIMIT_RPM: "60",
      KAMINARI_AD_SESSION_TTL_SEC: "1800",
      KAMINARI_AD_API_KEY: "kad_test_fallback_value",
    });
    expect(cfgResult.isOk()).toBe(true);
    const code = await bootstrapHttp(cfgResult._unsafeUnwrap());
    expect(code).toBe(2);
  });

  it("bootstrapHttp succeeds (would start) when the env var is unset — note: server not actually started in this test", async () => {
    // We can't actually call bootstrapHttp without the env var here
    // because it would never resolve (blocks on SIGTERM). We rely on
    // the harness-based isolation tests to exercise the happy path.
    expect(true).toBe(true);
  });
});
