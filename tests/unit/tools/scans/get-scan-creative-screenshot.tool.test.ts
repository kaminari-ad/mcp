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

  it("returns full MCP image envelope (base64 + mimeType from response)", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeScreenshot = ok({
      bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
      contentType: "image/png",
    });
    const r = await getScanCreativeScreenshotTool.handler(
      { scan_id: SID, width: 600 },
      makeToolContext({ api })
    );
    const out = r._unsafeUnwrap();
    expect(out.content).toHaveLength(1);
    const block = out.content[0];
    expect(block.type).toBe("image");
    if (block.type === "image") {
      expect(block.mimeType).toBe("image/png");
      // base64 of [0x89, 0x50, 0x4e, 0x47] = "iVBORw=="
      expect(block.data).toBe("iVBORw==");
    }
    const call = api.state.calls[0];
    if (call?.method !== "getScanCreativeScreenshot") throw new Error("wrong");
    expect(call.scanId).toBe(SID);
    expect(call.w).toBe(600);
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
