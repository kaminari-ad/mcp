import { describe, expect, it } from "vitest";

import { createScanTool } from "../../../../src/application/tools/scans/create-scan.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createScanTool", () => {
  it("has canonical name and validates country_code length", () => {
    expect(createScanTool.name).toBe("create_scan");
    expect(() =>
      createScanTool.inputSchema.parse({
        url: "https://x.com",
        country_code: "USA",
        emulator_id: "default",
      })
    ).toThrow();
  });

  it("forwards body verbatim and returns the created scan", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const result = await createScanTool.handler(
      {
        url: "https://ad.example.com/a",
        country_code: "US",
        emulator_id: "default",
        labels: { campaign: "spring2026" },
        campaign_id: "00000000-0000-0000-0000-000000000ccc",
      },
      ctx
    );
    expect(result.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "createScan") throw new Error("wrong method");
    expect(call.body).toEqual({
      country_code: "US",
      emulator_id: "default",
      url: "https://ad.example.com/a",
      labels: { campaign: "spring2026" },
      campaign_id: "00000000-0000-0000-0000-000000000ccc",
    });
  });

  it("omits all optional fields when not provided", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createScanTool.handler(
      { country_code: "US", emulator_id: "default", ad_tag: "<iframe/>" },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createScan") throw new Error("wrong method");
    expect(Object.keys(call.body).sort()).toEqual(["ad_tag", "country_code", "emulator_id"].sort());
  });

  it("forwards vast_tag when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createScanTool.handler(
      {
        country_code: "US",
        emulator_id: "default",
        vast_tag: "https://ad.server/vast?id=1",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createScan") throw new Error("wrong method");
    expect(call.body.vast_tag).toBe("https://ad.server/vast?id=1");
    expect(Object.keys(call.body).sort()).toEqual(
      ["country_code", "emulator_id", "vast_tag"].sort()
    );
  });

  it("forwards proxy targeting when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createScanTool.handler(
      {
        url: "https://x.com",
        country_code: "US",
        emulator_id: "default",
        proxy: { proxy_type: "mobile", city: "LA" },
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createScan") throw new Error("wrong method");
    expect(call.body.proxy).toEqual({ proxy_type: "mobile", city: "LA" });
  });

  it("forwards ad_discovery: true to the gateway request", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createScanTool.handler(
      {
        url: "https://publisher.example/page",
        country_code: "US",
        emulator_id: "default",
        ad_discovery: true,
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createScan") throw new Error("wrong method");
    expect(call.body.ad_discovery).toBe(true);
    expect(Object.keys(call.body).sort()).toEqual(
      ["ad_discovery", "country_code", "emulator_id", "url"].sort()
    );
  });

  it("omits the ad_discovery key entirely when the input leaves it unset", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createScanTool.handler(
      { url: "https://publisher.example/page", country_code: "US", emulator_id: "default" },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createScan") throw new Error("wrong method");
    expect("ad_discovery" in call.body).toBe(false);
  });

  it("forwards run_id when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createScanTool.handler(
      {
        url: "https://x.com",
        country_code: "US",
        emulator_id: "default",
        run_id: "00000000-0000-0000-0000-000000000rrr".replace(/r/g, "1"),
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createScan") throw new Error("wrong method");
    expect(call.body.run_id).toBeDefined();
  });

  it("maps invalid-input ApiError to ToolError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createScan = err(makeApiError("invalid-input", "url required"));
    const ctx = makeToolContext({ api });
    const result = await createScanTool.handler(
      { country_code: "US", emulator_id: "default", url: "https://x.com" },
      ctx
    );
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("invalid-input");
  });
});
