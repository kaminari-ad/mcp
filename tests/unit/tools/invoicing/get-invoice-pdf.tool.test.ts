import { describe, expect, it } from "vitest";

import { getInvoicePdfTool } from "../../../../src/application/tools/invoicing/get-invoice-pdf.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const IID = "00000000-0000-0000-0000-000000000fff";

describe("getInvoicePdfTool", () => {
  it("name + uuid validation", () => {
    expect(getInvoicePdfTool.name).toBe("get_invoice_pdf");
    expect(() => getInvoicePdfTool.inputSchema.parse({ invoice_id: "nope" })).toThrow();
  });

  it("returns resource block with kaminari-ad URI on success", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getInvoicePdf = ok({
      bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
      contentType: "application/pdf",
    });
    const r = await getInvoicePdfTool.handler({ invoice_id: IID }, makeToolContext({ api }));
    const out = r._unsafeUnwrap();
    expect(out.content[0].type).toBe("resource");
    if (out.content[0].type === "resource") {
      expect(out.content[0].resource.mimeType).toBe("application/pdf");
      expect(out.content[0].resource.uri).toBe(`kaminari-ad://invoices/${IID}.pdf`);
      expect(out.content[0].resource.blob).toBe("JVBERg==");
    }
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getInvoicePdf = err(makeApiError("not-found", "x"));
    expect(
      (await getInvoicePdfTool.handler({ invoice_id: IID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
