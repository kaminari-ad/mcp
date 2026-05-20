/**
 * Shared zod schema for a single PolicyEntry sum-type row.
 *
 * After COOP-13940 P3 the API accepts five rule kinds: tag, iab_v3,
 * brand, ai_category, custom_taxonomy. Discriminated by ``rule_type``;
 * exactly one value-block is populated. This module is the single
 * source of truth for `create_policy_set` + `update_policy_set` so
 * the tools' input schemas and the gateway's payload mapping never
 * drift.
 *
 * Country codes accept both ISO 3166-1 alpha-2 and alpha-3 (the API
 * normalises to uppercase + dedupes — empty array means all countries).
 */
import { z } from "zod";

const TIER1 = z.string().min(1).max(200);
const TIER_OPT = z.string().max(200).nullable().optional();

const IabV3Block = z.object({
  tier1: TIER1.describe("Top-level IAB Content Taxonomy V3 category (e.g. 'Sensitive Topics')."),
  tier2: TIER_OPT.describe("Sub-category (optional). Empty/null = subtree match."),
  tier3: TIER_OPT.describe("Sub-sub-category (optional)."),
  tier4: TIER_OPT.describe(
    "Leaf-level category (optional). When all 4 tiers set, leaf-only match."
  ),
});

const AiCategoryBlock = z.object({
  tier1: TIER1.describe("Top-level freeform AI-generated category (e.g. 'Gambling')."),
  tier2: TIER_OPT.describe("Sub-category (optional)."),
  tier3: TIER_OPT.describe("Sub-sub-category (optional)."),
  tier4: TIER_OPT.describe("Leaf-level category (optional)."),
});

const CustomTaxonomyBlock = z.object({
  taxonomy_id: z
    .string()
    .uuid()
    .describe("ID of the per-org custom taxonomy (see `list_custom_taxonomies`)."),
  tier1: TIER1.describe("Top-level node name in the taxonomy."),
  tier2: TIER_OPT.describe("Tier 2 node name (optional)."),
  tier3: TIER_OPT.describe("Tier 3 node name (optional)."),
  tier4: TIER_OPT.describe("Leaf node name (optional)."),
});

const COUNTRY_CODES = z
  .array(z.string().min(2).max(3))
  .max(50)
  .describe("Restrict the rule to these countries (ISO 3166-1 alpha-2 / alpha-3). Empty = all.");

/**
 * Discriminated union by ``rule_type``. Use this single schema in
 * both create and update tools so callers see one consistent shape.
 *
 * Note on null vs absent: the API accepts both for the inactive
 * value-blocks; we model them as optional in zod so agents can omit
 * fields they don't use.
 */
export const PolicyEntryInput = z
  .discriminatedUnion("rule_type", [
    z.object({
      rule_type: z
        .literal("tag")
        .describe("Match a specific tag slug emitted by the scan pipeline."),
      tag_slug: z
        .string()
        .min(1)
        .max(100)
        .describe("Tag slug (see `list_tags` for the catalogue)."),
      country_codes: COUNTRY_CODES,
    }),
    z.object({
      rule_type: z.literal("iab_v3").describe("Match the scan's canonical IAB V3 category prefix."),
      iab_v3: IabV3Block,
      country_codes: COUNTRY_CODES,
    }),
    z.object({
      rule_type: z
        .literal("brand")
        .describe("Match the scan's advertiser brand (case-insensitive)."),
      brand: z.string().min(1).max(200).describe("Brand string."),
      country_codes: COUNTRY_CODES,
    }),
    z.object({
      rule_type: z
        .literal("ai_category")
        .describe("Match the freeform LLM-generated category prefix on the scan."),
      ai_category: AiCategoryBlock,
      country_codes: COUNTRY_CODES,
    }),
    z.object({
      rule_type: z
        .literal("custom_taxonomy")
        .describe("Match a per-org custom taxonomy node prefix on the scan."),
      custom_taxonomy: CustomTaxonomyBlock,
      country_codes: COUNTRY_CODES,
    }),
  ])
  .describe(
    "One policy rule. Discriminated by `rule_type`; populate the matching value-block (tag_slug / iab_v3 / brand / ai_category / custom_taxonomy)."
  );

export type PolicyEntryInputType = z.infer<typeof PolicyEntryInput>;

/**
 * Map a validated input row to the API request shape. Adds the
 * other (null) value-blocks the API expects so the wire payload is
 * fully populated regardless of which kind the agent chose.
 */
interface Tiers {
  tier1: string;
  tier2: string | null;
  tier3: string | null;
  tier4: string | null;
}

interface CustomTaxonomyTiers extends Tiers {
  taxonomy_id: string;
}

export interface PolicyEntryRequestBody {
  rule_type: "tag" | "iab_v3" | "brand" | "ai_category" | "custom_taxonomy";
  tag_slug: string | null;
  iab_v3: Tiers | null;
  brand: string | null;
  ai_category: Tiers | null;
  custom_taxonomy: CustomTaxonomyTiers | null;
  country_codes: string[];
}

/**
 * Map a validated UI-shape PolicyEntry input to the API request body.
 * Always sets every value-block (the four inactive ones to ``null``)
 * so the wire payload matches the API's strict CHECK-constraint shape
 * regardless of which kind the agent picked.
 */
export function policyEntryToRequest(entry: PolicyEntryInputType): PolicyEntryRequestBody {
  const base: PolicyEntryRequestBody = {
    rule_type: entry.rule_type,
    tag_slug: null,
    iab_v3: null,
    brand: null,
    ai_category: null,
    custom_taxonomy: null,
    country_codes: [...entry.country_codes],
  };
  if (entry.rule_type === "tag") {
    return { ...base, tag_slug: entry.tag_slug };
  }
  if (entry.rule_type === "iab_v3") {
    return { ...base, iab_v3: normaliseTiers(entry.iab_v3) };
  }
  if (entry.rule_type === "brand") {
    return { ...base, brand: entry.brand };
  }
  if (entry.rule_type === "ai_category") {
    return { ...base, ai_category: normaliseTiers(entry.ai_category) };
  }
  return { ...base, custom_taxonomy: normaliseCustomTaxonomy(entry.custom_taxonomy) };
}

function normaliseTiers(t: {
  readonly tier1: string;
  readonly tier2?: string | null | undefined;
  readonly tier3?: string | null | undefined;
  readonly tier4?: string | null | undefined;
}): { tier1: string; tier2: string | null; tier3: string | null; tier4: string | null } {
  return {
    tier1: t.tier1,
    tier2: t.tier2 ?? null,
    tier3: t.tier3 ?? null,
    tier4: t.tier4 ?? null,
  };
}

function normaliseCustomTaxonomy(t: {
  readonly taxonomy_id: string;
  readonly tier1: string;
  readonly tier2?: string | null | undefined;
  readonly tier3?: string | null | undefined;
  readonly tier4?: string | null | undefined;
}): {
  taxonomy_id: string;
  tier1: string;
  tier2: string | null;
  tier3: string | null;
  tier4: string | null;
} {
  return {
    taxonomy_id: t.taxonomy_id,
    tier1: t.tier1,
    tier2: t.tier2 ?? null,
    tier3: t.tier3 ?? null,
    tier4: t.tier4 ?? null,
  };
}
