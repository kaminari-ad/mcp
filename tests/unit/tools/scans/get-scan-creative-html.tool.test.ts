import { describe, expect, it } from "vitest";

import { getScanCreativeHtmlTool } from "../../../../src/application/tools/scans/get-scan-creative-html.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000555";

describe("getScanCreativeHtmlTool", () => {
  it("read-only", () => {
    expect(getScanCreativeHtmlTool.name).toBe("get_scan_creative_html");
    expect(getScanCreativeHtmlTool.annotations.readOnlyHint).toBe(true);
  });
  it("decodes the markup as text so the model can read it", async () => {
    const api = createFakeApiGateway();
    const r = await getScanCreativeHtmlTool.handler({ scan_id: SID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({
      scan_id: SID,
      content_type: "text/plain; charset=utf-8",
      byte_size: 19,
      html: "<div>creative</div>",
    });
    expect(api.state.calls[0]).toEqual({ method: "getScanCreativeHtml", scanId: SID });
  });
  it("decodes multi-byte characters correctly", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeHtml = ok({
      bytes: new TextEncoder().encode("<p>Скидка 90%</p>"),
      contentType: "text/plain",
    });
    const r = await getScanCreativeHtmlTool.handler({ scan_id: SID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().html).toBe("<p>Скидка 90%</p>");
  });

  // The 256 KiB ceiling is enforced in the gateway while reading the
  // socket (see `http-api-gateway.test.ts`); this asserts the tool
  // passes that refusal through legibly rather than re-deriving it.
  it("surfaces the gateway's size refusal instead of swallowing it", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeHtml = err(
      makeApiError("upstream", "Artifact is larger than the 256.0 KiB this tool will transfer.")
    );
    const r = await getScanCreativeHtmlTool.handler({ scan_id: SID }, makeToolContext({ api }));
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().message).toContain("256.0 KiB");
  });
  it("maps a not-found from a scan without a creative", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanCreativeHtml = err(makeApiError("not-found", "x"));
    expect(
      (await getScanCreativeHtmlTool.handler({ scan_id: SID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
