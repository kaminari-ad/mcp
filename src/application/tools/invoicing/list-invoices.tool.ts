/**
 * Tool: `list_invoices` — paginated list of invoices issued to the org.
 */

import { z } from "zod";

import type { InvoiceResponse, PaginatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListInvoicesInputShape = {
  type: z
    .enum(["proforma", "final"])
    .optional()
    .describe(
      "Filter by invoice kind: proforma (advance bill) or final (issued after the period)."
    ),
  status: z
    .enum(["draft", "issued", "paid", "voided", "overdue"])
    .optional()
    .describe("Filter by lifecycle status."),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListInvoicesInputShape = typeof ListInvoicesInputShape;

export type ListInvoicesOutput = PaginatedResponse<InvoiceResponse>;

export const listInvoicesTool: Tool<ListInvoicesInputShape, ListInvoicesOutput> = {
  name: "list_invoices",
  description:
    "List invoices issued to the organization with number, type, status, total in micros, currency, due/paid dates. Filter by `type` and / or `status`. Use `get_invoice_pdf` to download the PDF for a specific invoice.",
  annotations: {
    title: "List Invoices",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListInvoicesInputShape),
  handler: async (input, ctx): Promise<Result<ListInvoicesOutput, ToolError>> => {
    const filters = {
      page: input.page,
      limit: input.limit,
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    };
    const result = await ctx.api.listInvoices(filters);
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
