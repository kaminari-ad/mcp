import { describe, expect, it } from "vitest";

import { getScanLandingScreenshotTool } from "../../../../src/application/tools/scans/get-scan-landing-screenshot.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000aaa";

describe("getScanLandingScreenshotTool", () => {
  it("name + uuid + landing_ord validation", () => {
    expect(getScanLandingScreenshotTool.name).toBe("get_scan_landing_screenshot");
    expect(() =>
      getScanLandingScreenshotTool.inputSchema.parse({ scan_id: SID, landing_ord: -1 })
    ).toThrow();
    expect(() =>
      getScanLandingScreenshotTool.inputSchema.parse({ scan_id: SID, landing_ord: 51 })
    ).toThrow();
  });

  it("forwards landing_ord and returns image block", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanLandingScreenshot = ok({
      bytes: new Uint8Array([0x89]),
      contentType: "image/png",
    });
    const r = await getScanLandingScreenshotTool.handler(
      { scan_id: SID, landing_ord: 2, width: 600 },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().content[0].type).toBe("image");
    const call = api.state.calls[0];
    if (call?.method !== "getScanLandingScreenshot") throw new Error("wrong");
    expect(call.landingOrd).toBe(2);
    expect(call.w).toBe(600);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanLandingScreenshot = err(makeApiError("not-found", "x"));
    expect(
      (
        await getScanLandingScreenshotTool.handler(
          { scan_id: SID, landing_ord: 0 },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
