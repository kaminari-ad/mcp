import { describe, expect, it } from "vitest";

import { getScanCreativeScreenshotTool } from "../../../../src/application/tools/scans/get-scan-creative-screenshot.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000aaa";

describe("getScanCreativeScreenshotTool", () => {
  it("name + uuid validation", () => {
    expect(getScanCreativeScreenshotTool.name).toBe("get_scan_creative_screenshot");
    expect(() => getScanCreativeScreenshotTool.inputSchema.parse({ scan_id: "nope" })).toThrow();
  });

  it("returns image content block", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeScreenshot = ok({
      bytes: new Uint8Array([0x89]),
      contentType: "image/png",
    });
    const r = await getScanCreativeScreenshotTool.handler(
      { scan_id: SID },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().content[0].type).toBe("image");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeScreenshot = err(makeApiError("not-found", "x"));
    expect(
      (
        await getScanCreativeScreenshotTool.handler({ scan_id: SID }, makeToolContext({ api }))
      ).isErr()
    ).toBe(true);
  });
});
