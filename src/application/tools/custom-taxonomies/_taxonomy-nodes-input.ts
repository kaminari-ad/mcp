/**
 * Shared zod schema for a taxonomy-node array (used by both
 * `create_custom_taxonomy` and `update_custom_taxonomy`).
 *
 * Each node carries a caller-chosen ``client_id`` that's only used
 * to express parent/child relationships in the flat array — the API
 * stitches the tree from those, allocates real UUIDs, and discards
 * the client ids on response. ``is_default`` marks the fallback
 * node for scans the LLM cannot confidently classify; exactly one
 * node per taxonomy must be ``is_default=true``.
 */

import { z } from "zod";

export const TaxonomyNodeShape = z.object({
  client_id: z
    .string()
    .min(1)
    .max(100)
    .describe(
      "Caller-chosen string id used to wire parent/child links inside this request only. The API allocates real UUIDs on response."
    ),
  parent_client_id: z
    .string()
    .min(1)
    .max(100)
    .nullable()
    .optional()
    .describe("client_id of this node's parent. null/omitted = top-level node."),
  name: z.string().min(1).max(100).describe("Display name of the node."),
  description: z
    .string()
    .max(200)
    .optional()
    .describe(
      "Free-form description shown to the LLM during classification — keep it concrete (one sentence)."
    ),
  is_default: z
    .boolean()
    .optional()
    .describe(
      "Mark this node as the fallback bucket. Exactly ONE node per taxonomy must be is_default=true."
    ),
});

export type TaxonomyNodeShapeType = z.infer<typeof TaxonomyNodeShape>;
