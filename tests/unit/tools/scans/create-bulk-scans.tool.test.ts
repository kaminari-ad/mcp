import { describe, expect, it } from "vitest";

import { createBulkScansTool } from "../../../../src/application/tools/scans/create-bulk-scans.tool.js";
import {
  createFakeApiGateway,
  DEFAULT_SCAN,
  err,
  makeApiError,
  ok,
} from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createBulkScansTool", () => {
  it("has canonical name and rejects empty country_codes", () => {
    expect(createBulkScansTool.name).toBe("create_bulk_scans");
    expect(() =>
      createBulkScansTool.inputSchema.parse({
        url: "https://x.com",
        country_codes: [],
        emulator_id: "default",
      })
    ).toThrow();
  });

  it("forwards labels + ad_tag + country list verbatim to the gateway", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const result = await createBulkScansTool.handler(
      {
        ad_tag: "<iframe/>",
        country_codes: ["US", "DE", "JP"],
        emulator_id: "default",
        labels: { batch: "qa" },
      },
      ctx
    );
    expect(result.isOk()).toBe(true);

    const call = api.state.calls[0];
    if (call?.method !== "createBulkScans") throw new Error("wrong method");
    expect(call.body.ad_tag).toBe("<iframe/>");
    expect(call.body.labels).toEqual({ batch: "qa" });
    expect(call.body.country_codes).toEqual(["US", "DE", "JP"]);
  });

  it("omits url / labels when not provided", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createBulkScansTool.handler(
      {
        url: "https://x.com",
        country_codes: ["US"],
        emulator_id: "default",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createBulkScans") throw new Error("wrong method");
    expect(call.body.labels).toBeUndefined();
    expect(call.body.ad_tag).toBeUndefined();
    expect(call.body.url).toBe("https://x.com");
  });

  it("forwards vast_tag when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createBulkScansTool.handler(
      {
        vast_tag: "https://ad.server/vast?id=1",
        country_codes: ["US", "DE"],
        emulator_id: "default",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createBulkScans") throw new Error("wrong method");
    expect(call.body.vast_tag).toBe("https://ad.server/vast?id=1");
    expect(call.body.url).toBeUndefined();
    expect(call.body.ad_tag).toBeUndefined();
  });

  it("forwards proxy targeting when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createBulkScansTool.handler(
      {
        url: "https://x.com",
        country_codes: ["US"],
        emulator_id: "default",
        proxy: { proxy_type: "residential", region: "CA" },
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createBulkScans") throw new Error("wrong method");
    expect(call.body.proxy).toEqual({ proxy_type: "residential", region: "CA" });
  });

  it("forwards the repeat / retry trio, which multiplies the batch per country", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createBulkScansTool.handler(
      {
        url: "https://x.com",
        country_codes: ["US", "DE"],
        emulator_id: "default",
        repeat_count: 4,
        repeat_mode: "isolated",
        retry_max_attempts: 1,
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createBulkScans") throw new Error("wrong method");
    expect(call.body.repeat_count).toBe(4);
    expect(call.body.repeat_mode).toBe("isolated");
    expect(call.body.retry_max_attempts).toBe(1);
  });

  it("omits the repeat / retry keys when the input leaves them unset", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createBulkScansTool.handler(
      { url: "https://x.com", country_codes: ["US"], emulator_id: "default" },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createBulkScans") throw new Error("wrong method");
    expect("repeat_count" in call.body).toBe(false);
    expect("repeat_mode" in call.body).toBe(false);
    expect("retry_max_attempts" in call.body).toBe(false);
  });

  it("returns one leader per country under repeats, each with its own siblings", async () => {
    // What the description promises: `total` counts countries, not scans,
    // and the extra repeats are reachable only through `repeat_scan_ids`.
    const api = createFakeApiGateway();
    api.state.responses.createBulkScans = ok([
      {
        ...DEFAULT_SCAN,
        country_code: "US",
        repeat_total: 2,
        repeat_scan_ids: ["00000000-0000-0000-0000-000000000ab1"],
      },
      {
        ...DEFAULT_SCAN,
        country_code: "DE",
        repeat_total: 2,
        repeat_scan_ids: ["00000000-0000-0000-0000-000000000ab2"],
      },
    ]);
    const result = await createBulkScansTool.handler(
      {
        url: "https://x.com",
        country_codes: ["US", "DE"],
        emulator_id: "default",
        repeat_count: 2,
      },
      makeToolContext({ api })
    );
    const out = result._unsafeUnwrap();
    expect(out.total).toBe(2);
    expect(out.items.map((s) => s.country_code)).toEqual(["US", "DE"]);
    expect(out.items.map((s) => s.repeat_scan_ids)).toEqual([
      ["00000000-0000-0000-0000-000000000ab1"],
      ["00000000-0000-0000-0000-000000000ab2"],
    ]);
  });

  it("rejects an out-of-range repeat_count at the zod boundary", () => {
    const base = { url: "https://x.com", country_codes: ["US"], emulator_id: "default" };
    expect(() => createBulkScansTool.inputSchema.parse({ ...base, repeat_count: 0 })).toThrow();
    expect(() =>
      createBulkScansTool.inputSchema.parse({ ...base, retry_max_attempts: 6 })
    ).toThrow();
  });

  it("forwards referrer to every scan in the batch", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createBulkScansTool.handler(
      {
        vast_tag: "https://ad.server/vast?id=1",
        country_codes: ["US", "DE"],
        emulator_id: "default",
        referrer: "https://publisher.example/watch",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createBulkScans") throw new Error("wrong method");
    expect(call.body.referrer).toBe("https://publisher.example/watch");
  });

  it("omits the referrer key entirely when the input leaves it unset", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createBulkScansTool.handler(
      { url: "https://x.com", country_codes: ["US"], emulator_id: "default" },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createBulkScans") throw new Error("wrong method");
    expect("referrer" in call.body).toBe(false);
  });

  it("rejects a referrer the API would 422", () => {
    for (const referrer of [
      "publisher.example",
      "javascript:alert(1)",
      "file:///etc/passwd",
      "data:text/html,<b>x",
      `https://publisher.example/${"a".repeat(2048)}`,
    ]) {
      expect(() =>
        createBulkScansTool.inputSchema.parse({
          url: "https://x.com",
          country_codes: ["US"],
          emulator_id: "default",
          referrer,
        })
      ).toThrow();
    }
  });

  it("maps ApiError to ToolError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createBulkScans = err(makeApiError("forbidden", "billing suspended"));
    const ctx = makeToolContext({ api });
    const result = await createBulkScansTool.handler(
      { url: "https://x.com", country_codes: ["US"], emulator_id: "default" },
      ctx
    );
    expect(result.isErr()).toBe(true);
  });

  it("propagates the gateway's empty-array response as total=0", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createBulkScans = ok([]);
    const ctx = makeToolContext({ api });
    const result = await createBulkScansTool.handler(
      { url: "https://x.com", country_codes: ["US", "DE"], emulator_id: "default" },
      ctx
    );
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().total).toBe(0);
  });
});
