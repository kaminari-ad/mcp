/**
 * Tool: `get_invoice_pdf` — fetch one invoice as an inline PDF blob.
 */

import { z } from "zod";

import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import { type BinaryContentEnvelope, resourceBlock } from "../_shared/binary-content.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const GetInvoicePdfInputShape = {
  invoice_id: z.string().uuid().describe("Invoice UUID — see `list_invoices`."),
} as const;
type GetInvoicePdfInputShape = typeof GetInvoicePdfInputShape;

export type GetInvoicePdfOutput = BinaryContentEnvelope;

export const getInvoicePdfTool: Tool<GetInvoicePdfInputShape, GetInvoicePdfOutput> = {
  name: "get_invoice_pdf",
  description:
    "Download one invoice as an inline PDF (base64-encoded). Returned as a single MCP resource content block — agents can save / forward it without a second API call.",
  annotations: {
    title: "Get Invoice PDF",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(GetInvoicePdfInputShape),
  handler: async (input, ctx): Promise<Result<GetInvoicePdfOutput, ToolError>> => {
    const result = await ctx.api.getInvoicePdf(input.invoice_id);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(
      resourceBlock(
        result.value.bytes,
        result.value.contentType,
        `kaminari-ad://invoices/${input.invoice_id}.pdf`
      )
    );
  },
};
