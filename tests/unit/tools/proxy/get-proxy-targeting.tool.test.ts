import { describe, expect, it } from "vitest";

import { getProxyTargetingTool } from "../../../../src/application/tools/proxy/get-proxy-targeting.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const US_RESIDENTIAL = {
  country_code: "US",
  proxy_type: "residential",
  regions: ["florida", "texas"],
  cities: ["philadelphia"],
  isps: ["comcast cable", "spectrum"],
  refreshed_at: "2026-08-20T18:00:00Z",
  ttl_seconds: 86400,
};

describe("getProxyTargetingTool", () => {
  it("has the canonical name and schema", () => {
    expect(getProxyTargetingTool.name).toBe("get_proxy_targeting");
    expect(Object.keys(getProxyTargetingTool.inputSchema.shape)).toEqual([
      "country_code",
      "proxy_type",
      "region",
    ]);
  });

  it("returns the catalogue on success", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getProxyTargeting = ok(US_RESIDENTIAL);
    const result = await getProxyTargetingTool.handler(
      { country_code: "US" },
      makeToolContext({ api })
    );
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(US_RESIDENTIAL);
  });

  it("omits optional filters instead of sending undefined", async () => {
    const api = createFakeApiGateway();
    await getProxyTargetingTool.handler({ country_code: "US" }, makeToolContext({ api }));
    expect(api.state.calls).toEqual([
      { method: "getProxyTargeting", query: { country_code: "US" } },
    ]);
  });

  it("passes proxy_type and region through", async () => {
    const api = createFakeApiGateway();
    await getProxyTargetingTool.handler(
      { country_code: "us", proxy_type: "mobile", region: "california" },
      makeToolContext({ api })
    );
    expect(api.state.calls).toEqual([
      {
        method: "getProxyTargeting",
        query: { country_code: "us", proxy_type: "mobile", region: "california" },
      },
    ]);
  });

  it("maps gateway error into ToolError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getProxyTargeting = err(makeApiError("upstream", "down"));
    const result = await getProxyTargetingTool.handler(
      { country_code: "US" },
      makeToolContext({ api })
    );
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ kind: "upstream", message: "down" });
  });
});
