/**
 * Tool: `list_emulators` — the catalog of device/OS profiles for scans.
 *
 * Use this BEFORE `create_scan` / `create_campaign` to pick a valid
 * `emulator_id` (the `id` field of an entry).
 */

import { z } from "zod";

import type { EmulatorResponse } from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { mapApiError } from "../../services/api-error-mapper.js";
import type { Tool } from "../_shared/tool.js";
import type { ToolError } from "../_shared/tool-result.js";

const ListEmulatorsInputShape = {} as const;
type ListEmulatorsInputShape = typeof ListEmulatorsInputShape;

export interface ListEmulatorsOutput {
  readonly items: readonly EmulatorResponse[];
  readonly total: number;
}

export const listEmulatorsTool: Tool<ListEmulatorsInputShape, ListEmulatorsOutput> = {
  name: "list_emulators",
  description:
    "List every device/OS emulator profile available for scans (id, display name, category, browser). Use the `id` as `emulator_id` in `create_scan` / `create_campaign`.",
  annotations: {
    title: "List Emulators",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: z.object(ListEmulatorsInputShape),
  handler: async (_input, ctx): Promise<Result<ListEmulatorsOutput, ToolError>> => {
    const result = await ctx.api.listEmulators();
    if (result.isErr()) return err(mapApiError(result.error));
    return ok({ items: result.value, total: result.value.length });
  },
};
