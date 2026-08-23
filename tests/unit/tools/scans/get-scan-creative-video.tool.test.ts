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

  // The API caps nothing and base64 inflates by a third, so the
  // gateway refuses while reading the socket rather than buffering a
  // 200 MiB MediaFile into the hosted process. The fake mirrors that
  // ceiling so this stays a real test.
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
  });
  it("points at the cheaper alternatives so the agent can recover", () => {
    expect(getScanCreativeVideoTool.description).toContain("get_scan_creative_screenshot");
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
