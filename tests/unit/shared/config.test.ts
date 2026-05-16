import { describe, expect, it } from "vitest";

import { loadConfig } from "../../../src/shared/config.js";

describe("loadConfig", () => {
  it("returns defaults when nothing is set", () => {
    const result = loadConfig({});
    expect(result.isOk()).toBe(true);
    const cfg = result._unsafeUnwrap();
    expect(cfg.transport).toBe("stdio");
    expect(cfg.apiBaseUrl).toBe("https://kaminari.ad");
    expect(cfg.logLevel).toBe("info");
    expect(cfg.httpPort).toBe(8080);
    expect(cfg.sessionTtlSec).toBe(1800);
    expect(cfg.rateLimitRpm).toBe(120);
    expect(cfg.stdioApiKey).toBeUndefined();
  });

  it("parses overrides from env", () => {
    const result = loadConfig({
      TRANSPORT: "http",
      API_BASE_URL: "https://staging.kaminari.ad",
      LOG_LEVEL: "debug",
      HTTP_PORT: "9000",
      SESSION_TTL_SEC: "600",
      RATE_LIMIT_RPM: "60",
      KAMINARI_AD_API_KEY: "kad_abc1234567",
    });
    expect(result.isOk()).toBe(true);
    const cfg = result._unsafeUnwrap();
    expect(cfg.transport).toBe("http");
    expect(cfg.apiBaseUrl).toBe("https://staging.kaminari.ad");
    expect(cfg.logLevel).toBe("debug");
    expect(cfg.httpPort).toBe(9000);
    expect(cfg.sessionTtlSec).toBe(600);
    expect(cfg.rateLimitRpm).toBe(60);
    expect(cfg.stdioApiKey).toBe("kad_abc1234567");
  });

  it("rejects invalid TRANSPORT", () => {
    const result = loadConfig({ TRANSPORT: "ipx" });
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().issues).toMatchObject({ TRANSPORT: expect.any(Array) });
  });

  it("rejects negative HTTP_PORT", () => {
    const result = loadConfig({ HTTP_PORT: "-1" });
    expect(result.isErr()).toBe(true);
  });

  it("accepts HTTP_PORT=0 (random port for tests)", () => {
    const result = loadConfig({ HTTP_PORT: "0" });
    expect(result.isOk()).toBe(true);
  });

  it("rejects too-short KAMINARI_AD_API_KEY", () => {
    const result = loadConfig({ KAMINARI_AD_API_KEY: "abc" });
    expect(result.isErr()).toBe(true);
  });
});
