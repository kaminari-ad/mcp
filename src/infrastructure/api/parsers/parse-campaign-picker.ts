/**
 * Parser for `GET /api/v1/campaigns/picker` — slim per-row campaign
 * list designed for autocomplete / combobox UIs.
 *
 * `CampaignPickerItem` intentionally omits heavy fields (schedule,
 * proxy, labels, policy_set_id, …) so the picker endpoint stays
 * cheap even when an org has thousands of campaigns. Agents that
 * need full campaign details should fetch a specific id via
 * `get_campaign` after a picker selection.
 *
 * Wire shape is a BARE JSON array — no `{items, total, ...}`
 * envelope (the API treats picker as a non-paginated lookup table).
 */

import { z } from "zod";

import type { ApiError, CampaignPickerItem } from "../../../domain/ports/api-gateway.js";
import { schemas } from "../../../shared/api/zod-schemas.js";
import type { Result } from "../../../shared/result.js";
import { parseWithSchema } from "./parse-with-schema.js";

const CampaignPickerSchema = schemas.CampaignPickerItem.pick({
  id: true,
  name: true,
  group_id: true,
  is_archived: true,
}).strip();

const CampaignPickerArraySchema = z.array(CampaignPickerSchema);

export const parseCampaignPickerArray = (
  raw: unknown
): Result<readonly CampaignPickerItem[], ApiError> =>
  parseWithSchema(CampaignPickerArraySchema, raw, "campaigns-picker") as Result<
    readonly CampaignPickerItem[],
    ApiError
  >;
