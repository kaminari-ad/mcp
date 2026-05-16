import { describe, expect, it } from "vitest";

import { createBulkScansTool } from "../../../../src/application/tools/scans/create-bulk-scans.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
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

  it("returns items+total and forwards labels + ad_tag when given", async () => {
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
    expect(result._unsafeUnwrap().total).toBe(3);

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

  it("default response sizes match the requested country list", async () => {
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
