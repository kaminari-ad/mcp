import { describe, expect, it } from "vitest";

import { getScanCreativeVideoTool } from "../../../../src/application/tools/scans/get-scan-creative-video.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000555";

describe("getScanCreativeVideoTool", () => {
  it("read-only", () => {
    expect(getScanCreativeVideoTool.name).toBe("get_scan_creative_video");
    expect(getScanCreativeVideoTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns one base64 resource block citing the artifact path", async () => {
    const api = createFakeApiGateway();
    const r = await getScanCreativeVideoTool.handler({ scan_id: SID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({
      content: [
        {
          type: "resource",
          resource: {
            uri: `/api/v1/scans/${SID}/creative-video`,
            mimeType: "video/mp4",
            blob: Buffer.from(new Uint8Array([0x00, 0x00, 0x00, 0x18])).toString("base64"),
          },
        },
      ],
    });
    expect(api.state.calls[0]).toEqual({ method: "getScanCreativeVideo", scanId: SID });
  });

  // base64 inflates by a third and the API caps nothing, so a long
  // creative would otherwise blow up the tool result.
  it("refuses a video over the 8 MiB limit", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeVideo = ok({
      bytes: new Uint8Array(8 * 1024 * 1024 + 1),
      contentType: "video/mp4",
    });
    const r = await getScanCreativeVideoTool.handler({ scan_id: SID }, makeToolContext({ api }));
    expect(r.isErr()).toBe(true);
    const error = r._unsafeUnwrapErr();
    expect(error.kind).toBe("invalid-input");
    expect(error.message).toContain("8.0 MiB");
    expect(error.message).toContain("get_scan_creative_screenshot");
  });
  it("accepts a video exactly at the limit", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeVideo = ok({
      bytes: new Uint8Array(8 * 1024 * 1024),
      contentType: "video/mp4",
    });
    expect(
      (await getScanCreativeVideoTool.handler({ scan_id: SID }, makeToolContext({ api }))).isOk()
    ).toBe(true);
  });
  it("maps a not-found from a non-VAST scan", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeVideo = err(makeApiError("not-found", "x"));
    expect(
      (await getScanCreativeVideoTool.handler({ scan_id: SID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
