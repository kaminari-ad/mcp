import { describe, expect, it } from "vitest";

import { getScanTool } from "../../../../src/application/tools/scans/get-scan.tool.js";
import type { ScanResponse } from "../../../../src/domain/ports/api-gateway.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getScanTool", () => {
  it("has canonical name and requires a UUID scan_id", () => {
    expect(getScanTool.name).toBe("get_scan");
    expect(() => getScanTool.inputSchema.parse({ scan_id: "not-a-uuid" })).toThrow();
    expect(() =>
      getScanTool.inputSchema.parse({ scan_id: "00000000-0000-0000-0000-000000000aaa" })
    ).not.toThrow();
  });

  it("forwards scan_id to the gateway and returns the scan", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    const result = await getScanTool.handler(
      { scan_id: "00000000-0000-0000-0000-000000000aaa" },
      ctx
    );
    expect(result.isOk()).toBe(true);
    const call = api.state.calls[0];
    expect(call).toEqual({
      method: "getScan",
      scanId: "00000000-0000-0000-0000-000000000aaa",
    });
    // The agent links via the API-returned deep-links, never builds them.
    const scan = result._unsafeUnwrap();
    expect(scan.report_url).toContain("/scans/");
    expect(scan.public_report_url).toContain("/public/scans/");
    // A banner scan still carries the VAST-shaped fields (defaulted).
    expect(scan.creative_kind).toBe("banner");
    expect(scan.vast_tag).toBeNull();
    expect(scan.video).toBeNull();
  });

  it("surfaces vast_tag / creative_kind / video for a VAST scan", async () => {
    const api = createFakeApiGateway();
    const vastScan: ScanResponse = {
      id: "00000000-0000-0000-0000-000000000aaa",
      url: "",
      country_code: "US",
      emulator_id: "default",
      status: "completed",
      offer_url: "https://offer.example",
      screenshot_url: "",
      report_url: "https://app.kaminari.ad/scans/00000000-0000-0000-0000-000000000aaa",
      public_report_url:
        "https://app.kaminari.ad/public/scans/00000000-0000-0000-0000-000000000aaa",
      ad_tag: null,
      vast_tag: "https://ad.example.com/vast?id=1",
      creative_kind: "video",
      video: {
        duration_ms: 15000,
        mediafile_url: "https://cdn.example/ad.mp4",
        vast_version: "4.0",
        ad_system: "AdServer",
        is_vpaid: false,
        wrapper_depth: 1,
        click_through: "https://landing.example/offer",
      },
      creative_screenshot_url: "",
      page_title: "",
      elapsed_ms: 1000,
      error: "",
      labels: {},
      campaign_id: null,
      campaign_name: null,
      ad_discovery: false,
      network: "",
      created_at: "2026-05-16T12:00:00Z",
      completed_at: "2026-05-16T12:00:01Z",
      repeat_index: 0,
      repeat_total: 1,
      repeat_session_id: null,
      retry_attempt: 0,
      retry_max_attempts: 0,
    };
    api.state.responses.getScan = ok(vastScan);
    const ctx = makeToolContext({ api });

    const result = await getScanTool.handler(
      { scan_id: "00000000-0000-0000-0000-000000000aaa" },
      ctx
    );

    const scan = result._unsafeUnwrap();
    expect(scan.creative_kind).toBe("video");
    expect(scan.vast_tag).toBe("https://ad.example.com/vast?id=1");
    expect(scan.video?.vast_version).toBe("4.0");
  });

  it("maps a 404 ApiError to ToolError not-found", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScan = err(makeApiError("not-found", "Scan not found"));
    const ctx = makeToolContext({ api });
    const result = await getScanTool.handler(
      { scan_id: "00000000-0000-0000-0000-000000000aaa" },
      ctx
    );
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ kind: "not-found", message: "Scan not found" });
  });
});
