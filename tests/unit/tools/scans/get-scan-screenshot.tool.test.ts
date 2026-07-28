import { describe, expect, it } from "vitest";

import { getScanCreativeScreenshotTool } from "../../../../src/application/tools/scans/get-scan-creative-screenshot.tool.js";
import { getScanLandingScreenshotTool } from "../../../../src/application/tools/scans/get-scan-landing-screenshot.tool.js";
import { getScanScreenshotTool } from "../../../../src/application/tools/scans/get-scan-screenshot.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000aaa";

describe("getScanScreenshotTool", () => {
  it("name + uuid + width validation", () => {
    expect(getScanScreenshotTool.name).toBe("get_scan_screenshot");
    expect(() => getScanScreenshotTool.inputSchema.parse({ scan_id: "nope" })).toThrow();
    expect(() => getScanScreenshotTool.inputSchema.parse({ scan_id: SID, width: 49 })).toThrow();
    expect(() => getScanScreenshotTool.inputSchema.parse({ scan_id: SID, width: 2001 })).toThrow();
  });

  it("returns base64 image content block on success", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanScreenshot = ok({
      bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
      contentType: "image/png",
    });
    const r = await getScanScreenshotTool.handler(
      { scan_id: SID, width: 800 },
      makeToolContext({ api })
    );
    expect(r.isOk()).toBe(true);
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
    if (call?.method !== "getScanScreenshot") throw new Error("wrong");
    expect(call.scanId).toBe(SID);
    expect(call.w).toBe(800);
  });

  it("forwards undefined width when omitted", async () => {
    const api = createFakeApiGateway();
    await getScanScreenshotTool.handler({ scan_id: SID }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "getScanScreenshot") throw new Error("wrong");
    expect(call.w).toBeUndefined();
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanScreenshot = err(makeApiError("not-found", "x"));
    expect(
      (await getScanScreenshotTool.handler({ scan_id: SID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});

describe("resized-screenshot cropping caveat", () => {
  // The API top-crops a page or landing thumbnail past 2.5x its width, so
  // an agent reading a resized capture may be looking at the top region of
  // a much longer page. Creatives are never cropped — their aspect ratio is
  // the artefact under verification — so that tool must NOT carry the text.
  const widthText = (tool: {
    inputSchema: { shape: { width: { description?: string | undefined } } };
  }): string => tool.inputSchema.shape.width.description ?? "";

  it.each([
    ["get_scan_screenshot", getScanScreenshotTool],
    ["get_scan_landing_screenshot", getScanLandingScreenshotTool],
  ] as const)("%s warns about the crop and the way around it", (_name, tool) => {
    expect(widthText(tool)).toMatch(/2\.5x/);
    expect(widthText(tool)).toMatch(/without `width`/);
  });

  it("get_scan_creative_screenshot stays silent because it never crops", () => {
    expect(widthText(getScanCreativeScreenshotTool)).not.toMatch(/2\.5x/);
  });
});
