import { describe, expect, it } from "vitest";

import { getScanVastXmlTool } from "../../../../src/application/tools/scans/get-scan-vast-xml.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000555";

describe("getScanVastXmlTool", () => {
  it("read-only", () => {
    expect(getScanVastXmlTool.name).toBe("get_scan_vast_xml");
    expect(getScanVastXmlTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns the document as text with its size", async () => {
    const api = createFakeApiGateway();
    const r = await getScanVastXmlTool.handler({ scan_id: SID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({
      scan_id: SID,
      content_type: "application/xml",
      byte_size: 27,
      xml: '<VAST version="4.0"></VAST>',
    });
    expect(api.state.calls[0]).toEqual({ method: "getScanVastXml", scanId: SID });
  });
  it("refuses a document over the size limit", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanVastXml = ok({
      bytes: new Uint8Array(256 * 1024 + 1),
      contentType: "application/xml",
    });
    const r = await getScanVastXmlTool.handler({ scan_id: SID }, makeToolContext({ api }));
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().kind).toBe("invalid-input");
  });
  it("maps a not-found from a non-VAST scan", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanVastXml = err(makeApiError("not-found", "x"));
    expect(
      (await getScanVastXmlTool.handler({ scan_id: SID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
