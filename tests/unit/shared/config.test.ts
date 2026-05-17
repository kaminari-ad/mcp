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
    expect(cfg.logFormat).toBe("pretty");
    expect(cfg.httpPort).toBe(8080);
    expect(cfg.sessionTtlSec).toBe(1800);
    expect(cfg.rateLimitRpm).toBe(120);
    expect(cfg.stdioApiKey).toBeUndefined();
  });

  it("defaults logFormat to json in http mode", () => {
    const result = loadConfig({ KAMINARI_AD_TRANSPORT: "http" });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().logFormat).toBe("json");
  });

  it("honours explicit KAMINARI_AD_LOG_FORMAT over transport default", () => {
    const result = loadConfig({
      KAMINARI_AD_TRANSPORT: "stdio",
      KAMINARI_AD_LOG_FORMAT: "json",
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().logFormat).toBe("json");
  });

  it("parses overrides from env (all KAMINARI_AD_* prefixed)", () => {
    const result = loadConfig({
      KAMINARI_AD_TRANSPORT: "http",
      KAMINARI_AD_API_URL: "https://staging.kaminari.ad",
      KAMINARI_AD_LOG_LEVEL: "debug",
      KAMINARI_AD_LOG_FORMAT: "json",
      KAMINARI_AD_HTTP_PORT: "9000",
      KAMINARI_AD_SESSION_TTL_SEC: "600",
      KAMINARI_AD_RATE_LIMIT_RPM: "60",
      KAMINARI_AD_API_KEY: "kad_abc1234567",
    });
    expect(result.isOk()).toBe(true);
    const cfg = result._unsafeUnwrap();
    expect(cfg.transport).toBe("http");
    expect(cfg.apiBaseUrl).toBe("https://staging.kaminari.ad");
    expect(cfg.logLevel).toBe("debug");
    expect(cfg.logFormat).toBe("json");
    expect(cfg.httpPort).toBe(9000);
    expect(cfg.sessionTtlSec).toBe(600);
    expect(cfg.rateLimitRpm).toBe(60);
    expect(cfg.stdioApiKey).toBe("kad_abc1234567");
  });

  it("ignores generic env-var names without the prefix (namespace isolation)", () => {
    // Pre-existing `LOG_LEVEL=debug` from some other tool in the same
    // shell must not poison our config. We only read prefixed vars.
    const result = loadConfig({
      LOG_LEVEL: "debug",
      API_BASE_URL: "https://attacker.example",
      TRANSPORT: "http",
    });
    expect(result.isOk()).toBe(true);
    const cfg = result._unsafeUnwrap();
    expect(cfg.logLevel).toBe("info");
    expect(cfg.apiBaseUrl).toBe("https://kaminari.ad");
    expect(cfg.transport).toBe("stdio");
  });

  it("rejects invalid KAMINARI_AD_TRANSPORT", () => {
    const result = loadConfig({ KAMINARI_AD_TRANSPORT: "ipx" });
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().issues).toMatchObject({
      KAMINARI_AD_TRANSPORT: expect.any(Array),
    });
  });

  it("rejects invalid KAMINARI_AD_LOG_FORMAT", () => {
    const result = loadConfig({ KAMINARI_AD_LOG_FORMAT: "yaml" });
    expect(result.isErr()).toBe(true);
  });

  it("rejects negative KAMINARI_AD_HTTP_PORT", () => {
    const result = loadConfig({ KAMINARI_AD_HTTP_PORT: "-1" });
    expect(result.isErr()).toBe(true);
  });

  it("accepts KAMINARI_AD_HTTP_PORT=0 (random port for tests)", () => {
    const result = loadConfig({ KAMINARI_AD_HTTP_PORT: "0" });
    expect(result.isOk()).toBe(true);
  });

  it("rejects too-short KAMINARI_AD_API_KEY", () => {
    const result = loadConfig({ KAMINARI_AD_API_KEY: "abc" });
    expect(result.isErr()).toBe(true);
  });
});
