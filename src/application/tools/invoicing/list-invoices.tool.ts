/**
 * Tool: `list_invoices` — paginated list of invoices issued to the org.
 */

import { z } from "zod";

import { mapApiError } from "../../../domain/services/api-error-mapper.js";
import type { InvoiceResponse, PaginatedResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";

import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListInvoicesInputShape = {
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListInvoicesInputShape = typeof ListInvoicesInputShape;

export type ListInvoicesOutput = PaginatedResponse<InvoiceResponse>;

export const listInvoicesTool: Tool<ListInvoicesInputShape, ListInvoicesOutput> = {
  name: "list_invoices",
  description:
    "List invoices issued to the organization with number, status, total in micros, currency, due/paid dates. Use to find an invoice id; PDFs are available at https://app.kaminari.ad/api/v1/invoices/{id}/pdf (not exposed via MCP — agents return the URL to the user).",
  annotations: {
    title: "List Invoices",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListInvoicesInputShape),
  handler: async (input, ctx): Promise<Result<ListInvoicesOutput, ToolError>> => {
    const result = await ctx.api.listInvoices({ page: input.page, limit: input.limit });
    if (result.isErr()) return err(mapApiError(result.error));
    return ok(result.value);
  },
};
