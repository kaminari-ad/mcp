import { describe, expect, it } from "vitest";

import { getProxyTargetingTool } from "../../../../src/application/tools/geos/get-proxy-targeting.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getProxyTargetingTool", () => {
  it("name + read-only", () => {
    expect(getProxyTargetingTool.name).toBe("get_proxy_targeting");
    expect(getProxyTargetingTool.annotations.readOnlyHint).toBe(true);
    expect(getProxyTargetingTool.annotations.idempotentHint).toBe(true);
  });

  it("forwards every filter and returns the catalogue", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getProxyTargeting = ok({
      country_code: "US",
      proxy_type: "mobile",
      regions: ["California"],
      cities: ["Los Angeles"],
      isps: ["Verizon"],
      refreshed_at: "2026-08-26T00:00:00Z",
      ttl_seconds: 3600,
    });

    const r = await getProxyTargetingTool.handler(
      { country_code: "US", proxy_type: "mobile", region: "California" },
      makeToolContext({ api })
    );

    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().isps).toEqual(["Verizon"]);
    const call = api.state.calls[0];
    if (call?.method !== "getProxyTargeting") throw new Error("wrong");
    expect(call.filters).toEqual({
      country_code: "US",
      proxy_type: "mobile",
      region: "California",
    });
  });

  it("works with country_code alone", async () => {
    const api = createFakeApiGateway();

    const r = await getProxyTargetingTool.handler({ country_code: "DE" }, makeToolContext({ api }));

    expect(r.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "getProxyTargeting") throw new Error("wrong");
    expect(call.filters).toEqual({ country_code: "DE" });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getProxyTargeting = err(makeApiError("upstream", "x"));
    expect(
      (
        await getProxyTargetingTool.handler({ country_code: "US" }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
