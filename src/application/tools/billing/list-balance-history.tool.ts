/**
 * Tool: `list_balance_history` — paginated ledger view of the
 * organization's credit movements (charges, refunds, top-ups).
 */

import { z } from "zod";

import type {
  BalanceTransactionResponse,
  PaginatedResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const TransactionTypeEnum = z.enum([
  "initial_balance",
  "top_up_manual",
  "usage_charge",
  "subscription_renewal",
  "subscription_upgrade",
  "admin_adjustment",
  "refund",
  "invoice_settlement",
  "crypto_top_up",
]);

const ListBalanceHistoryInputShape = {
  date_from: z.string().date().optional().describe("ISO date, inclusive."),
  date_to: z.string().date().optional().describe("ISO date, inclusive."),
  type: z
    .array(TransactionTypeEnum)
    .max(9)
    .optional()
    .describe(
      "Filter by transaction kind. Pass several values to OR them (e.g. ['top_up_manual','crypto_top_up'] for credits-only)."
    ),
  page: z.number().int().min(1).max(500).default(1).describe("1-indexed page."),
  limit: z.number().int().min(1).max(200).default(50).describe("Page size."),
} as const;
type ListBalanceHistoryInputShape = typeof ListBalanceHistoryInputShape;

export type ListBalanceHistoryOutput = PaginatedResponse<BalanceTransactionResponse>;

export const listBalanceHistoryTool: Tool<ListBalanceHistoryInputShape, ListBalanceHistoryOutput> =
  {
    name: "list_balance_history",
    description:
      "List ledger transactions (charges, refunds, top-ups, invoice settlements) on the organization's balance. Each row: type, amount in micros, description, timestamp. Filter by `type` (multi-select) and / or date range.",
    annotations: {
      title: "List Balance History",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: z.object(ListBalanceHistoryInputShape),
    handler: async (input, ctx): Promise<Result<ListBalanceHistoryOutput, ToolError>> => {
      const filters = {
        page: input.page,
        limit: input.limit,
        ...(input.date_from !== undefined ? { date_from: input.date_from } : {}),
        ...(input.date_to !== undefined ? { date_to: input.date_to } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
      };
      const result = await ctx.api.listBalanceHistory(filters);
      if (result.isErr()) return err(mapApiError(result.error));
      return ok(result.value);
    },
  };
