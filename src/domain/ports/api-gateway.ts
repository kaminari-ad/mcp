/**
 * Port: outbound calls to the Kaminari Ad `/api/v1` surface.
 *
 * Tools depend on this interface, never on `undici`, `fetch`, or any
 * other HTTP detail. The concrete `HttpApiGateway` lives in
 * `infrastructure/api/` and is built per request with the caller's
 * `Authorization`.
 *
 * Type strategy
 * -------------
 * All DTO types are projections over the generated `openapi.ts`
 * (source of truth: api repo's `/openapi.json`). We use `Pick<>` to
 * narrow each response to the fields most useful to an agent — large
 * nested arrays (redirect chains, classifications, landings) are
 * intentionally excluded to keep tool outputs token-cheap.
 *
 * Because the projections reference `components["schemas"][X]` field
 * names, the next `npm run gen:api-types` plus `tsc` will surface any
 * API field rename / removal as a compile error.
 *
 * Every method returns `Result<Success, ApiError>`. Tools convert
 * `ApiError` to `ToolError` via the `mapApiError` application service.
 */

import type { components } from "../../shared/api/openapi.js";
import type { Result } from "../../shared/result.js";

type S = components["schemas"];

/**
 * Discriminated-union representation of all the failure modes a tool
 * needs to distinguish. Network and parse errors collapse into
 * `upstream`; the API's typed business errors map to the named
 * variants.
 */
export type ApiError =
  | { readonly kind: "unauthorized"; readonly detail: string }
  | { readonly kind: "forbidden"; readonly detail: string; readonly code?: string }
  | { readonly kind: "not-found"; readonly detail: string }
  | { readonly kind: "rate-limited"; readonly detail: string; readonly retryAfterMs?: number }
  | {
      readonly kind: "invalid-input";
      readonly detail: string;
      readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
      /**
       * Optional machine-readable code (e.g. `policies.in_use`).
       * Forward-compat: today the API rarely sets `code` on 400/422,
       * but `delete_policy_set` is a known candidate to grow one in a
       * future API release. The MCP preserves any `code` it sees so
       * agents can branch programmatically without us cutting another
       * release.
       */
      readonly code?: string;
    }
  | { readonly kind: "upstream"; readonly detail: string; readonly status?: number };

/** Generic paginated envelope (matches every `PaginatedResponse_*_`). */
export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

// ── Account ────────────────────────────────────────────────────────

export type OrgResponse = Pick<
  S["OrgResponse"],
  "id" | "name" | "owner_id" | "is_active" | "created_at"
>;

export type UserResponse = Pick<
  S["UserResponse"],
  "id" | "email" | "name" | "role_name" | "is_active" | "created_at"
>;

export type RoleResponse = Pick<
  S["RoleResponse"],
  "id" | "name" | "scope" | "is_system" | "permissions"
>;

export type ApiKeyResponse = Pick<
  S["ApiKeyResponse"],
  "id" | "key_prefix" | "name" | "expires_at" | "created_at"
>;

export type ApiKeyCreatedResponse = Pick<
  S["ApiKeyCreatedResponse"],
  "id" | "key_prefix" | "full_key" | "name" | "expires_at" | "created_at"
>;

export type UpdateOrgRequest = Pick<S["UpdateOrgRequest"], "name">;
/** API source has `name: string` (defaulted to ""); we expose it as optional. */
export type InviteUserRequest = Pick<S["InviteUserRequest"], "email" | "role_id"> & {
  readonly name?: string;
};
export type UpdateUserRoleRequest = Pick<S["UpdateUserRoleRequest"], "role_id">;
export type CreateApiKeyRequest = Pick<S["CreateApiKeyRequest"], "name" | "expires_at">;

// ── Scans ──────────────────────────────────────────────────────────

export type ScanBriefResponse = Pick<
  S["ScanBriefResponse"],
  | "id"
  | "url"
  | "country_code"
  | "status"
  | "offer_url"
  | "screenshot_url"
  | "labels"
  | "elapsed_ms"
  | "campaign_id"
  | "campaign_name"
  | "is_ad_tag"
  | "created_at"
>;

/**
 * `GET /api/v1/runs/{run_id}/scans` returns a deliberately slim
 * per-tile shape (NOT `ScanBriefResponse`). Fields are tailored for
 * the run-detail UI's tile grid — no input `url`, no labels, no
 * campaign linkage (the caller already knows the run's campaign).
 * Use `getScan(id)` to fetch the full scan details for any tile.
 */
export type ScanTileResponse = Pick<
  S["ScanTileResponse"],
  "id" | "country_code" | "status" | "offer_url" | "screenshot_url" | "elapsed_ms" | "error"
>;

/**
 * Narrow scan view: omits heavy nested arrays
 * (redirect_chain, landings, classification). Agents that need them
 * can request them through dedicated tools (future work).
 */
export type ScanResponse = Pick<
  S["ScanResponse"],
  | "id"
  | "url"
  | "country_code"
  | "emulator_id"
  | "status"
  | "offer_url"
  | "screenshot_url"
  | "ad_tag"
  | "creative_screenshot_url"
  | "page_title"
  | "elapsed_ms"
  | "error"
  | "labels"
  | "campaign_id"
  | "campaign_name"
  | "created_at"
  | "completed_at"
>;

export type ScanTagResponse = Pick<
  S["ScanTagResponse"],
  | "id"
  | "scan_id"
  | "tag_slug"
  | "detail"
  | "url"
  | "display_name"
  | "category"
  | "severity"
  | "created_at"
>;

export type RecheckResponse = Pick<S["RecheckResponse"], "queued_count">;
export type CancelPendingResponse = Pick<S["CancelPendingResponse"], "cancelled_count">;

export type CreateScanRequest = Pick<
  S["CreateScanRequest"],
  "url" | "ad_tag" | "country_code" | "emulator_id" | "labels" | "campaign_id" | "run_id"
>;

export type BulkScanRequest = Pick<
  S["BulkScanRequest"],
  "url" | "ad_tag" | "country_codes" | "emulator_id" | "labels"
>;

export type RecheckRequest = Pick<S["RecheckRequest"], "scope_type" | "scope_value">;

// ── Geos / emulators ──────────────────────────────────────────────

export type GeoResponse = Pick<S["GeoResponse"], "country_code" | "name" | "region" | "tier">;

export type EmulatorResponse = Pick<
  S["EmulatorResponse"],
  "id" | "display_name" | "category" | "browser"
>;

// ── Campaigns ─────────────────────────────────────────────────────

export type CampaignResponse = Pick<
  S["CampaignResponse"],
  | "id"
  | "name"
  | "campaign_type"
  | "url"
  | "ad_tag"
  | "country_codes"
  | "group_id"
  | "labels"
  | "policy_set_id"
  | "schedule_enabled"
  | "schedule_type"
  | "is_archived"
  | "created_at"
  | "last_run_at"
>;

export type CampaignGroupResponse = Pick<
  S["CampaignGroupResponse"],
  "id" | "name" | "is_default" | "is_archived" | "schedule_paused" | "campaign_count" | "created_at"
>;

/**
 * Slim per-row campaign shape for selection UIs
 * (`GET /api/v1/campaigns/picker`). Intentionally omits heavy fields
 * (schedule, proxy, country_codes, labels, policy_set_id, …) so the
 * picker stays cheap for orgs with thousands of campaigns. Agents
 * that need full details should call `get_campaign(id)` after a
 * selection.
 */
export type CampaignPickerItem = Pick<
  S["CampaignPickerItem"],
  "id" | "name" | "group_id" | "is_archived"
>;

export type RunResponse = Pick<
  S["RunResponse"],
  | "id"
  | "campaign_id"
  | "label"
  | "total"
  | "completed"
  | "failed"
  | "partial"
  | "cancelled"
  | "source"
  | "created_at"
>;

/**
 * Both `run_ids` and `failures` default to empty arrays in the API
 * — they're declared optional in the spec and present only when
 * action produced runs or per-campaign failures. The schema-based
 * parser emits the keys when populated, omits them when empty.
 */
export type GroupActionResponse = Pick<
  S["GroupActionResponse"],
  "group_id" | "affected_campaigns" | "cancelled_count" | "run_ids" | "failures"
>;

export type CreateCampaignRequest = Pick<
  S["CreateCampaignRequest"],
  | "name"
  | "campaign_type"
  | "url"
  | "ad_tag"
  | "country_codes"
  | "group_id"
  | "emulator_categories"
  | "labels"
  | "policy_set_id"
  | "schedule_enabled"
>;

export type UpdateCampaignRequest = Pick<
  S["UpdateCampaignRequest"],
  "name" | "country_codes" | "labels" | "policy_set_id" | "schedule_enabled"
>;

export type CreateCampaignGroupRequest = Pick<S["CreateCampaignGroupRequest"], "name">;
export type UpdateCampaignGroupRequest = Pick<S["UpdateCampaignGroupRequest"], "name">;

// ── Tag definitions ───────────────────────────────────────────────

export type TagDefinitionResponse = Pick<
  S["TagDefinitionWithStatsResponse"],
  | "slug"
  | "category"
  | "source"
  | "display_name"
  | "description"
  | "severity"
  | "is_system"
  | "organization_id"
  | "visibility"
  | "scans_count"
  | "rules_count"
>;

/**
 * Minimal info about a custom rule that produces a given tag — used
 * inside the `TagDefinitionDetailResponse` `linked_rules` array. Slim
 * by design: agents that want full rule details can call
 * `get_custom_rule(id)`. Kept narrow so the tag detail payload stays
 * token-cheap for orgs with hundreds of rules per tag.
 */
export type LinkedRule = Pick<S["LinkedRuleResponse"], "id" | "name" | "is_active">;

/**
 * Detail view for a single tag definition (`GET /api/v1/tag-definitions/{slug}`).
 *
 * The detail endpoint returns the full `TagDefinitionDetailResponse`
 * which extends the per-row `TagDefinitionWithStatsResponse` with
 * the `linked_rules` array — agents using `get_tag_definition` see
 * which custom rules currently produce this tag without having to
 * grep `list_custom_rules` by `tag_slug` themselves.
 *
 * The array MAY be absent (older API versions return the field only
 * when the tag has linked rules); both `linked_rules: []` and the
 * key being absent are valid — agents should treat both as "no
 * rules currently linked".
 */
export interface TagDefinitionDetailResponse extends TagDefinitionResponse {
  readonly linked_rules?: readonly LinkedRule[];
}

export type UpdateTagDefinitionRequest = Pick<
  S["UpdateTagDefinitionRequest"],
  "display_name" | "description" | "visibility" | "severity"
>;

// ── Custom rules ──────────────────────────────────────────────────

export type CustomRuleResponse = Pick<
  S["CustomRuleResponse"],
  | "id"
  | "organization_id"
  | "name"
  | "tag_slug"
  | "rule_type"
  | "config"
  | "target"
  | "is_active"
  | "created_at"
>;

export type RuleTestRequest = Pick<
  S["RuleTestRequest"],
  "rule_type" | "config" | "target" | "scan_id"
>;

export type RuleTestResponse = Pick<S["RuleTestResponse"], "matched" | "elapsed_ms"> & {
  /** Per-tag match results (typed loosely — the API ships full per-tag detail). */
  readonly tags: readonly Readonly<{ tag_slug: string; detail?: string | null }>[];
};

/**
 * API source has `tag_slug` and `target` as required strings (with
 * defaults "" and "page"). Agent ergonomics — surface them as optional.
 */
export type CreateCustomRuleRequest = Pick<
  S["CreateCustomRuleRequest"],
  "name" | "rule_type" | "config"
> & {
  readonly tag_slug?: string;
  readonly target?: string;
};

export type UpdateCustomRuleRequest = Pick<
  S["UpdateCustomRuleRequest"],
  "name" | "tag_slug" | "config" | "target" | "is_active"
>;

// ── Policy sets ───────────────────────────────────────────────────

export type PolicySetResponse = Pick<
  S["PolicySetResponse"],
  | "id"
  | "name"
  | "description"
  | "organization_id"
  | "visibility"
  | "is_approved"
  | "entries"
  | "created_at"
>;

/**
 * `GET /api/v1/policy-sets` returns a slim per-item shape that
 * intentionally OMITS `entries` (the API exposes `PolicySetListItem`
 * for paginated list views — entries are loaded on demand via
 * `getPolicySet(id)`). Using the full `PolicySetResponse` for list
 * items would fail zod parse on every real call because `entries`
 * is required there but absent in the list payload.
 */
export type PolicySetListItemResponse = Pick<
  S["PolicySetListItem"],
  "id" | "name" | "description" | "organization_id" | "visibility" | "is_approved" | "created_at"
>;

/**
 * Sum-type policy rule. Discriminated by ``rule_type``; exactly one
 * value-block is populated per row:
 *
 *   - ``tag``             -> ``tag_slug``
 *   - ``iab_v3``          -> ``iab_v3`` (IAB Content Taxonomy V3 prefix, tier1..4)
 *   - ``brand``           -> ``brand`` (case-insensitive equality)
 *   - ``ai_category``     -> ``ai_category`` (freeform LLM-generated prefix)
 *   - ``custom_taxonomy`` -> ``custom_taxonomy`` (per-org node prefix)
 *
 * The remaining blocks are ``null``. Agents that only care about one
 * kind can branch on ``rule_type`` and ignore the rest. ``country_codes``
 * narrows the rule to specific ISO countries; an empty list means all.
 */
export type PolicyEntryResponse = Pick<
  S["PolicyEntryResponse"],
  | "id"
  | "rule_type"
  | "tag_slug"
  | "iab_v3"
  | "brand"
  | "ai_category"
  | "custom_taxonomy"
  | "country_codes"
>;

export type CreatePolicySetRequest = Pick<
  S["CreatePolicySetRequest"],
  "name" | "description" | "entries"
>;

export type UpdatePolicySetRequest = Pick<
  S["UpdatePolicySetRequest"],
  "name" | "description" | "entries"
>;

// ── Custom taxonomies ─────────────────────────────────────────────

/**
 * Per-org custom classification taxonomy. Slim summary used by the
 * list endpoint (`GET /api/v1/custom-taxonomies`); the full tree is
 * fetched separately via `getCustomTaxonomy` to keep the list page
 * token-cheap for orgs with many taxonomies.
 */
export type CustomTaxonomyListItem = Pick<
  S["CustomTaxonomyListItem"],
  | "id"
  | "name"
  | "slug"
  | "description"
  | "is_active"
  | "version"
  | "node_count"
  | "created_at"
  | "updated_at"
>;

/**
 * One node inside a custom taxonomy tree. ``parent_id`` is null for
 * top-level nodes; ``level`` is 1-based; ``position`` is the
 * 0-indexed sibling order. Exactly one node per taxonomy is marked
 * ``is_default`` — that's the fallback for scans the LLM cannot
 * confidently classify into the rest of the tree.
 */
export type TaxonomyNodeResponse = Pick<
  S["TaxonomyNodeResponse"],
  "id" | "parent_id" | "level" | "position" | "name" | "description" | "is_default"
>;

/**
 * Full custom taxonomy with its tree. Returned by getCustomTaxonomy,
 * createCustomTaxonomy, updateCustomTaxonomy, restoreCustomTaxonomy.
 *
 * `nodes` is narrowed to the agent-facing `TaxonomyNodeResponse`
 * Pick. The OpenAPI envelope already lists the full schema; we keep
 * the same field set on the wire and a thinner public type.
 *
 * The non-`nodes` fields use `Pick<S["CustomTaxonomyResponse"], …>`
 * so a future API rename / removal fails this file at `tsc`
 * immediately on the next regen.
 */
export type CustomTaxonomyResponse = Pick<
  S["CustomTaxonomyResponse"],
  | "id"
  | "organization_id"
  | "name"
  | "slug"
  | "description"
  | "is_active"
  | "version"
  | "created_at"
  | "updated_at"
> & {
  readonly nodes: readonly TaxonomyNodeResponse[];
};

/**
 * Request shape for one node when creating or updating a taxonomy.
 *
 * ``client_id`` and ``parent_client_id`` are arbitrary strings the
 * caller chooses to express the parent-child relationship in a flat
 * array (the API stitches the tree from these). They never persist —
 * after the request returns, ``id`` (UUID) is the canonical handle.
 */
export type TaxonomyNodeRequest = Pick<
  S["TaxonomyNodeRequest"],
  "client_id" | "parent_client_id" | "name" | "description" | "is_default"
>;

export type CreateCustomTaxonomyRequest = Pick<
  S["CreateCustomTaxonomyRequest"],
  "name" | "description" | "nodes"
>;

export type UpdateCustomTaxonomyRequest = Pick<
  S["UpdateCustomTaxonomyRequest"],
  "name" | "description" | "nodes"
>;

export type ParseTaxonomyTextRequest = Pick<S["ParseTaxonomyTextRequest"], "text">;

/** One node parsed from free-form text — agents finish the tree by setting is_default + parent links. */
export type ParsedTaxonomyNode = Pick<S["ParsedTaxonomyNode"], "level" | "name" | "description">;

/**
 * Result of `POST /api/v1/custom-taxonomies/parse-text`. Always a
 * preview — nothing is persisted until the agent calls
 * `createCustomTaxonomy` with the returned nodes (after picking a
 * default). Warnings list any rows the parser had to skip / repair.
 *
 * `nodes` is narrowed to the agent-facing `ParsedTaxonomyNode` Pick;
 * `warnings` keeps the upstream `string[]` shape.
 */
export type ParseTaxonomyTextResponse = Pick<S["ParseTaxonomyTextResponse"], "warnings"> & {
  readonly nodes: readonly ParsedTaxonomyNode[];
};

// ── Alerts ────────────────────────────────────────────────────────

/**
 * Alert row.
 *
 * `rule_type` is the kind of policy rule that triggered the alert
 * (one of: ``tag``, ``iab_v3``, ``brand``, ``ai_category``,
 * ``custom_taxonomy``). `matched_value` is the canonical text the
 * scan matched against the rule (e.g. tag display name, IAB tier
 * path, brand string, taxonomy node path) — null only for legacy
 * rows produced before COOP-13940 P3.
 *
 * `tag_slug` / `tag_display_name` remain populated for legacy
 * tag-kind alerts; for non-tag kinds inspect `matched_value`.
 */
export type AlertResponse = Pick<
  S["AlertResponse"],
  | "id"
  | "scan_id"
  | "campaign_id"
  | "policy_set_id"
  | "violation_rule_id"
  | "rule_type"
  | "matched_value"
  | "tag_slug"
  | "tag_display_name"
  | "country_code"
  | "status"
  | "closed_by"
  | "scan_url"
  | "offer_url"
  | "created_at"
  | "updated_at"
>;

export type AlertStatsResponse = Pick<
  S["AlertStatsResponse"],
  "open" | "acknowledged" | "resolved" | "dismissed"
>;

export type UpdateAlertStatusRequest = Pick<S["UpdateAlertStatusRequest"], "status">;

// ── Webhooks ──────────────────────────────────────────────────────

export type WebhookResponse = Pick<
  S["WebhookResponse"],
  | "id"
  | "url"
  | "description"
  | "event_types"
  | "campaign_ids"
  | "is_active"
  | "disabled_reason"
  | "disabled_at"
  | "health"
  | "created_at"
  | "updated_at"
>;

/**
 * `POST /api/v1/webhooks` returns a wrapped envelope
 * `{ webhook, secret }`. The `secret` is shown exactly once on
 * creation / rotation; the server stores only a hash thereafter.
 *
 * Defined manually (not via Pick) because the wrapped `webhook` is the
 * narrowed agent-facing `WebhookResponse`, not the full API shape.
 */
export interface WebhookCreatedResponse {
  readonly webhook: WebhookResponse;
  readonly secret: string;
}

export type DeliveryAttemptResponse = Pick<
  S["DeliveryAttemptResponse"],
  | "id"
  | "event_id"
  | "event_type"
  | "response_status"
  | "success"
  | "attempt_number"
  | "error_code"
  | "elapsed_ms"
  | "created_at"
>;

export type EventCatalogEntryResponse = Pick<
  S["EventCatalogEntryResponse"],
  "event_type" | "description"
> & {
  /** Sample payload omitted from agent view (heavy nested JSON). */
  readonly sample_payload?: Readonly<Record<string, unknown>>;
};

/**
 * Wraps a list of {@link EventCatalogEntryResponse}.
 *
 * Defined as a hand-written interface (not `Pick<S["EventCatalogResponse"]>`)
 * because the projected `entries` field references our narrowed
 * `EventCatalogEntryResponse` (sample payloads omitted), which is a
 * structural subtype of the SDK shape but not the same TypeScript type.
 */
export interface EventCatalogResponse {
  readonly entries: readonly EventCatalogEntryResponse[];
}

export type BulkReplayResponse = Pick<S["BulkReplayResponse"], "replayed" | "skipped">;

export type CreateWebhookRequest = Pick<
  S["CreateWebhookRequest"],
  "url" | "description" | "event_types" | "campaign_ids"
>;

export type UpdateWebhookRequest = Pick<
  S["UpdateWebhookRequest"],
  "url" | "description" | "event_types" | "campaign_ids" | "is_active"
>;

export type BulkReplayRequest = Pick<S["BulkReplayRequest"], "from_ts" | "to_ts">;

// ── Billing / invoicing ───────────────────────────────────────────

export type BillingSummaryResponse = Pick<
  S["BillingSummaryResponse"],
  | "balance_micros"
  | "plan_id"
  | "plan_name"
  | "checks_per_period"
  | "checks_used"
  | "period_start"
  | "period_end"
  | "price_per_extra_check_micros"
  | "is_suspended"
  | "can_create_scan"
  | "billing_mode"
> & {
  /**
   * Why scans are blocked, if any.
   *
   * API source narrows this to a specific enum (`no_subscription` |
   * `suspended` | `insufficient_funds`). We surface it as `string |
   * null` for agent ergonomics — new reasons added on the API side
   * surface without an MCP release.
   */
  readonly block_reason: string | null;
};

export type UsageResponse = Pick<
  S["UsageResponse"],
  | "id"
  | "scan_id"
  | "charged_micros"
  | "balance_after_micros"
  | "within_plan"
  | "event_type"
  | "created_at"
>;

export type UsagePeriodSummaryResponse = Pick<
  S["UsagePeriodSummaryResponse"],
  | "period_start"
  | "period_end"
  | "checks"
  | "rechecks"
  | "within_plan"
  | "overage"
  | "charged_micros"
>;

export type BalanceTransactionResponse = Pick<
  S["BalanceTransactionResponse"],
  | "id"
  | "type"
  | "amount_micros"
  | "balance_after_micros"
  | "description"
  | "reference_kind"
  | "reference_id"
  | "actor_user_id"
  | "created_at"
>;

export type InvoiceResponse = Pick<
  S["InvoiceResponse"],
  | "id"
  | "number"
  | "type"
  | "status"
  | "total_micros"
  | "currency"
  | "period_start"
  | "period_end"
  | "issued_at"
  | "paid_at"
  | "voided_at"
  | "has_pdf"
  | "description"
  | "payment_method"
  | "created_at"
> & {
  /** Loose typing on the lifecycle enums — see `block_reason` rationale. */
  readonly type: string;
  readonly status: string;
};

// ── Alert notifications ───────────────────────────────────────────

export type AlertNotificationDestinationResponse = Pick<
  S["AlertNotificationDestinationResponse"],
  | "id"
  | "channel"
  | "name"
  | "is_active"
  | "is_default_target"
  | "version"
  | "consecutive_failures"
  | "last_delivery_at"
  | "last_delivery_status"
  | "slack_workspace_id"
  | "slack_channel_name"
  | "telegram_chat_title"
  | "telegram_chat_type"
  | "email_address"
  | "included_label_keys"
  | "created_at"
  | "updated_at"
>;

export type CampaignOverridesResponse = Pick<
  S["CampaignOverridesResponse"],
  "campaign_id" | "mode" | "destination_ids"
>;

// ── Webhook test ───────────────────────────────────────────────────

export type TestWebhookRequest = Pick<S["TestWebhookRequest"], "event_type">;

export type TestWebhookResponse = Pick<
  S["TestWebhookResponse"],
  "success" | "response_status" | "elapsed_ms" | "error_code" | "response_body"
>;

export type SetDestinationVersionRequest = Pick<S["SetDestinationVersionRequest"], "version">;

export type SetCampaignOverridesRequest = Pick<
  S["SetCampaignOverridesRequest"],
  "mode" | "destination_ids"
>;

// ── Filters (query params, not body schemas) ──────────────────────

/**
 * Filters for `GET /api/v1/scans`. All filter fields are optional;
 * the API applies a 7-day rolling window on `date_from` if no
 * temporal filter is set. `label_*` is a dynamic key family — the
 * gateway whitelists every `label_<key>` from the caller's
 * label-definitions on the request and forwards them verbatim.
 */
export interface ListScansFilters {
  readonly status?: string;
  readonly country_code?: string;
  readonly url?: string;
  readonly scan_id?: string;
  readonly date_from?: string;
  readonly date_to?: string;
  readonly timezone?: string;
  readonly run_id?: string;
  readonly campaign_id?: string;
  readonly group_id?: string;
  readonly tag?: string;
  readonly ai_category?: string;
  readonly iab_v3_category?: string;
  readonly iab_category?: string;
  readonly brand?: string;
  readonly page: number;
  readonly limit: number;
  /** Dynamic per-org label filters: `label_<key>=<value>`. */
  readonly [labelKey: `label_${string}`]: string | number | undefined;
}

export interface ListAlertsFilters {
  readonly campaign_id?: string;
  readonly status?: string;
  readonly page: number;
  readonly limit: number;
}

/**
 * Filters for `GET /api/v1/billing/usage`. ``date_from`` /
 * ``date_to`` accept ISO 8601 *datetime* strings (with timezone
 * offset) — the API treats them as inclusive bounds. Plain dates
 * (YYYY-MM-DD) also work; the API normalises to UTC midnight.
 */
export interface ListUsageFilters {
  readonly date_from?: string;
  readonly date_to?: string;
  readonly scan_id?: string;
  readonly page: number;
  readonly limit: number;
}

/** Possible values for ``ListBalanceHistoryFilters.type``. */
export type BalanceTransactionType =
  | "initial_balance"
  | "top_up_manual"
  | "usage_charge"
  | "subscription_renewal"
  | "subscription_upgrade"
  | "admin_adjustment"
  | "refund"
  | "invoice_settlement"
  | "crypto_top_up";

export interface ListBalanceHistoryFilters {
  readonly date_from?: string;
  readonly date_to?: string;
  /** Multi-select: pass several values to OR them. */
  readonly type?: readonly BalanceTransactionType[];
  readonly page: number;
  readonly limit: number;
}

/** Possible values for ``ListInvoicesFilters.type`` and ``status``. */
export type InvoiceType = "proforma" | "final";
export type InvoiceStatus = "draft" | "issued" | "paid" | "voided" | "overdue";

/**
 * Filters for `GET /api/v1/invoices`. The OpenAPI spec also lists
 * `organization_id` as a query — it is intentionally NOT exposed via
 * MCP because the public `/api/v1` is always org-scoped to the
 * caller's Bearer token. Cross-tenant queries belong on
 * `/api/admin/*`, which MCP does not consume.
 */
export interface ListInvoicesFilters extends PageFilters {
  readonly type?: InvoiceType;
  readonly status?: InvoiceStatus;
}

export interface ListWebhookDeliveriesFilters extends PageFilters {
  readonly success?: boolean;
  /** ISO 8601 datetime (inclusive). */
  readonly from_ts?: string;
  readonly to_ts?: string;
}

export interface ListTagsFilters {
  readonly category?: string;
}

// ── Account labels ────────────────────────────────────────────────

export type LabelDefinitionResponse = Pick<
  S["LabelDefinitionResponse"],
  "key" | "display_name" | "position" | "auto_extract"
>;

/**
 * Item shape used inside ``UpdateLabelDefinitionsRequest.labels`` —
 * the API derives ``position`` from array order on update.
 */
export type LabelDefinitionItem = Pick<
  S["LabelDefinitionItem"],
  "key" | "display_name" | "auto_extract"
>;

export type UpdateLabelDefinitionsRequest = Pick<S["UpdateLabelDefinitionsRequest"], "labels">;

// ── Custom roles (write side) ─────────────────────────────────────

export type CreateCustomRoleRequest = Pick<S["CreateCustomRoleRequest"], "name" | "permissions">;

// ── Binary downloads ──────────────────────────────────────────────

/**
 * Raw bytes + content-type returned from a binary endpoint
 * (`GET /scans/.../screenshot`, `GET /invoices/.../pdf`). The bytes
 * stay opaque to the gateway — tools base64-encode them inline when
 * building the MCP `image` / `resource` content block.
 */
export interface BinaryDownload {
  readonly bytes: Uint8Array;
  readonly contentType: string;
}

export interface PageFilters {
  readonly page: number;
  readonly limit: number;
}

export interface ListCampaignsFilters extends PageFilters {
  readonly group_id?: string;
  readonly archived?: boolean;
  readonly q?: string;
}

/**
 * Filters for `GET /api/v1/campaigns/picker` (NOT paginated). The
 * picker returns a bare array capped by `limit` and tuned for
 * autocomplete UIs.
 */
export interface ListCampaignsPickerFilters {
  readonly archived?: boolean;
  readonly group_id?: string;
  readonly q?: string;
  readonly limit?: number;
}

/**
 * Filters for `GET /api/v1/policy-sets` (list).
 *
 * `visibility` narrows the result to one scope:
 *   - `private` — org-owned sets only;
 *   - `public`  — Kaminari Ad-curated sets visible to every org.
 *
 * Omit the field to get **both** combined (the API treats absence as
 * "no filter"). There is no explicit `all` value on the API side.
 */
export interface ListPolicySetsFilters extends PageFilters {
  readonly visibility?: "private" | "public";
}

/**
 * Port for outbound calls to `/api/v1`. Every method maps 1:1 to an
 * MCP tool. Path / body shapes mirror the generated OpenAPI types.
 */
export interface ApiGateway {
  // Account
  getAccount(): Promise<Result<OrgResponse, ApiError>>;
  updateOrg(body: UpdateOrgRequest): Promise<Result<OrgResponse, ApiError>>;
  listOrgUsers(): Promise<Result<readonly UserResponse[], ApiError>>;
  inviteUser(body: InviteUserRequest): Promise<Result<UserResponse, ApiError>>;
  /** API returns 204 No Content; gateway surfaces `null` on success. */
  updateUserRole(userId: string, body: UpdateUserRoleRequest): Promise<Result<null, ApiError>>;
  removeUser(userId: string): Promise<Result<null, ApiError>>;
  transferOwnership(userId: string): Promise<Result<null, ApiError>>;
  listOrgRoles(): Promise<Result<readonly RoleResponse[], ApiError>>;
  listApiKeys(): Promise<Result<readonly ApiKeyResponse[], ApiError>>;
  createApiKey(body: CreateApiKeyRequest): Promise<Result<ApiKeyCreatedResponse, ApiError>>;
  revokeApiKey(keyId: string): Promise<Result<null, ApiError>>;

  // Scans
  listScans(
    filters: ListScansFilters
  ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>>;
  getScan(scanId: string): Promise<Result<ScanResponse, ApiError>>;
  createScan(body: CreateScanRequest): Promise<Result<ScanResponse, ApiError>>;
  createBulkScans(body: BulkScanRequest): Promise<Result<readonly ScanResponse[], ApiError>>;
  recheckScans(body: RecheckRequest): Promise<Result<RecheckResponse, ApiError>>;
  cancelScan(scanId: string): Promise<Result<CancelPendingResponse, ApiError>>;
  listScanTags(scanId: string): Promise<Result<readonly ScanTagResponse[], ApiError>>;

  // Geos / emulators
  listGeos(): Promise<Result<readonly GeoResponse[], ApiError>>;
  listEmulators(): Promise<Result<readonly EmulatorResponse[], ApiError>>;

  // Campaigns
  listCampaigns(
    filters: ListCampaignsFilters
  ): Promise<Result<PaginatedResponse<CampaignResponse>, ApiError>>;
  getCampaign(id: string): Promise<Result<CampaignResponse, ApiError>>;
  createCampaign(body: CreateCampaignRequest): Promise<Result<CampaignResponse, ApiError>>;
  updateCampaign(
    id: string,
    body: UpdateCampaignRequest
  ): Promise<Result<CampaignResponse, ApiError>>;
  runCampaign(id: string): Promise<Result<RunResponse, ApiError>>;
  archiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>>;
  unarchiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>>;
  cancelCampaign(id: string): Promise<Result<CancelPendingResponse, ApiError>>;
  listCampaignRuns(
    campaignId: string,
    filters: PageFilters
  ): Promise<Result<PaginatedResponse<RunResponse>, ApiError>>;
  /**
   * `GET /api/v1/campaigns/picker` — slim per-row list for
   * autocomplete / combobox UIs. Returns a bare array (not paginated)
   * — the API treats picker as a non-paginated lookup table.
   */
  listCampaignsPicker(
    filters?: ListCampaignsPickerFilters
  ): Promise<Result<readonly CampaignPickerItem[], ApiError>>;

  // Runs
  getRun(id: string): Promise<Result<RunResponse, ApiError>>;
  cancelRun(id: string): Promise<Result<CancelPendingResponse, ApiError>>;
  listRunScans(
    runId: string,
    filters: PageFilters
  ): Promise<Result<PaginatedResponse<ScanTileResponse>, ApiError>>;

  // Campaign groups
  /**
   * API returns a bare `CampaignGroupResponse[]` (not paginated).
   * Documented query param is only `archived?: boolean` — no `page` / `limit`.
   */
  listCampaignGroups(filters?: {
    readonly archived?: boolean;
  }): Promise<Result<readonly CampaignGroupResponse[], ApiError>>;
  getCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  createCampaignGroup(
    body: CreateCampaignGroupRequest
  ): Promise<Result<CampaignGroupResponse, ApiError>>;
  updateCampaignGroup(
    id: string,
    body: UpdateCampaignGroupRequest
  ): Promise<Result<CampaignGroupResponse, ApiError>>;
  runCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>>;
  cancelCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>>;
  /** Returns `GroupActionResponse` (action summary), NOT the group entity. */
  archiveCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>>;
  /** Returns `GroupActionResponse` (action summary), NOT the group entity. */
  unarchiveCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>>;
  pauseCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  resumeCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;

  // Tag definitions
  listTags(filters?: ListTagsFilters): Promise<Result<readonly TagDefinitionResponse[], ApiError>>;
  getTagDefinition(slug: string): Promise<Result<TagDefinitionDetailResponse, ApiError>>;
  /** API returns 204 No Content; gateway surfaces `null` on success. */
  updateTagDefinition(
    slug: string,
    body: UpdateTagDefinitionRequest
  ): Promise<Result<null, ApiError>>;
  deleteTagDefinition(slug: string): Promise<Result<null, ApiError>>;

  // Custom rules
  listCustomRules(
    filters: PageFilters
  ): Promise<Result<PaginatedResponse<CustomRuleResponse>, ApiError>>;
  getCustomRule(id: string): Promise<Result<CustomRuleResponse, ApiError>>;
  createCustomRule(body: CreateCustomRuleRequest): Promise<Result<CustomRuleResponse, ApiError>>;
  updateCustomRule(
    id: string,
    body: UpdateCustomRuleRequest
  ): Promise<Result<CustomRuleResponse, ApiError>>;
  deleteCustomRule(id: string): Promise<Result<null, ApiError>>;
  testCustomRule(body: RuleTestRequest): Promise<Result<RuleTestResponse, ApiError>>;

  // Policy sets
  listPolicySets(
    filters: ListPolicySetsFilters
  ): Promise<Result<PaginatedResponse<PolicySetListItemResponse>, ApiError>>;
  getPolicySet(id: string): Promise<Result<PolicySetResponse, ApiError>>;
  createPolicySet(body: CreatePolicySetRequest): Promise<Result<PolicySetResponse, ApiError>>;
  updatePolicySet(
    id: string,
    body: UpdatePolicySetRequest
  ): Promise<Result<PolicySetResponse, ApiError>>;
  deletePolicySet(id: string): Promise<Result<null, ApiError>>;

  // Account labels
  listAccountLabels(): Promise<Result<readonly LabelDefinitionResponse[], ApiError>>;
  /** Replace the org's full label set; returns the new list. */
  updateAccountLabels(
    body: UpdateLabelDefinitionsRequest
  ): Promise<Result<readonly LabelDefinitionResponse[], ApiError>>;

  // Custom roles (write side)
  createCustomRole(body: CreateCustomRoleRequest): Promise<Result<RoleResponse, ApiError>>;

  // Binary downloads
  /** Returns raw PNG bytes (and the inferred content-type from the response). */
  getScanScreenshot(scanId: string, w?: number): Promise<Result<BinaryDownload, ApiError>>;
  getScanCreativeScreenshot(scanId: string, w?: number): Promise<Result<BinaryDownload, ApiError>>;
  getScanLandingScreenshot(
    scanId: string,
    landingOrd: number,
    w?: number
  ): Promise<Result<BinaryDownload, ApiError>>;
  getInvoicePdf(invoiceId: string): Promise<Result<BinaryDownload, ApiError>>;

  // Custom taxonomies
  listCustomTaxonomies(): Promise<Result<readonly CustomTaxonomyListItem[], ApiError>>;
  getCustomTaxonomy(id: string): Promise<Result<CustomTaxonomyResponse, ApiError>>;
  createCustomTaxonomy(
    body: CreateCustomTaxonomyRequest
  ): Promise<Result<CustomTaxonomyResponse, ApiError>>;
  updateCustomTaxonomy(
    id: string,
    body: UpdateCustomTaxonomyRequest
  ): Promise<Result<CustomTaxonomyResponse, ApiError>>;
  /** API returns 204 No Content; gateway surfaces `null` on success. */
  deleteCustomTaxonomy(id: string): Promise<Result<null, ApiError>>;
  restoreCustomTaxonomy(id: string): Promise<Result<CustomTaxonomyResponse, ApiError>>;
  parseCustomTaxonomyText(
    body: ParseTaxonomyTextRequest
  ): Promise<Result<ParseTaxonomyTextResponse, ApiError>>;
  /** API returns 204 No Content; gateway surfaces `null` on success. */
  requestPolicySetApproval(id: string): Promise<Result<null, ApiError>>;

  // Alerts
  listAlerts(
    filters: ListAlertsFilters
  ): Promise<Result<PaginatedResponse<AlertResponse>, ApiError>>;
  updateAlertStatus(
    alertId: string,
    body: UpdateAlertStatusRequest
  ): Promise<Result<null, ApiError>>;
  getAlertStats(): Promise<Result<AlertStatsResponse, ApiError>>;

  // Webhooks
  listWebhooks(): Promise<Result<readonly WebhookResponse[], ApiError>>;
  getWebhook(id: string): Promise<Result<WebhookResponse, ApiError>>;
  createWebhook(body: CreateWebhookRequest): Promise<Result<WebhookCreatedResponse, ApiError>>;
  updateWebhook(id: string, body: UpdateWebhookRequest): Promise<Result<WebhookResponse, ApiError>>;
  deleteWebhook(id: string): Promise<Result<null, ApiError>>;
  testWebhook(
    endpointId: string,
    body: TestWebhookRequest
  ): Promise<Result<TestWebhookResponse, ApiError>>;
  rotateWebhookSecret(endpointId: string): Promise<Result<WebhookCreatedResponse, ApiError>>;
  listWebhookEventTypes(): Promise<Result<EventCatalogResponse, ApiError>>;
  listWebhookDeliveries(
    endpointId: string,
    filters: ListWebhookDeliveriesFilters
  ): Promise<Result<PaginatedResponse<DeliveryAttemptResponse>, ApiError>>;
  replayWebhookDelivery(attemptId: string): Promise<Result<null, ApiError>>;
  bulkReplayWebhook(
    endpointId: string,
    body: BulkReplayRequest
  ): Promise<Result<BulkReplayResponse, ApiError>>;

  // Billing
  getBillingSummary(): Promise<Result<BillingSummaryResponse, ApiError>>;
  listUsage(filters: ListUsageFilters): Promise<Result<PaginatedResponse<UsageResponse>, ApiError>>;
  getUsageSummary(): Promise<Result<UsagePeriodSummaryResponse, ApiError>>;
  listBalanceHistory(
    filters: ListBalanceHistoryFilters
  ): Promise<Result<PaginatedResponse<BalanceTransactionResponse>, ApiError>>;

  // Invoicing
  listInvoices(
    filters: ListInvoicesFilters
  ): Promise<Result<PaginatedResponse<InvoiceResponse>, ApiError>>;

  // Alert notifications
  listAlertDestinations(): Promise<
    Result<readonly AlertNotificationDestinationResponse[], ApiError>
  >;
  deleteAlertDestination(id: string): Promise<Result<null, ApiError>>;
  /**
   * API returns 204 No Content; gateway surfaces `null` on success.
   * Fetch the updated destination via `listAlertDestinations` if
   * the new state is needed.
   */
  setAlertDestinationVersion(
    id: string,
    body: SetDestinationVersionRequest
  ): Promise<Result<null, ApiError>>;
  getCampaignAlertOverrides(
    campaignId: string
  ): Promise<Result<CampaignOverridesResponse, ApiError>>;
  /** API returns 204 No Content; gateway surfaces `null` on success. */
  setCampaignAlertOverrides(
    campaignId: string,
    body: SetCampaignOverridesRequest
  ): Promise<Result<null, ApiError>>;
}
