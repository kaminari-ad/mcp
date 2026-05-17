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

export type GroupActionResponse = Pick<
  S["GroupActionResponse"],
  "group_id" | "affected_campaigns" | "cancelled_count" | "run_ids"
> & {
  /** Surfaced loosely — API has `{ campaign_id, error_code, detail }`. */
  readonly failures: readonly unknown[];
};

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
  | "show_in_public_report"
  | "scans_count"
  | "rules_count"
>;

export type TagDefinitionDetailResponse = TagDefinitionResponse;

export type UpdateTagDefinitionRequest = Pick<
  S["UpdateTagDefinitionRequest"],
  "display_name" | "description" | "show_in_public_report" | "severity"
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

export type PolicyEntryResponse = Pick<
  S["PolicyEntryResponse"],
  "id" | "tag_slug" | "country_codes"
>;

export type CreatePolicySetRequest = Pick<
  S["CreatePolicySetRequest"],
  "name" | "description" | "entries"
>;

export type UpdatePolicySetRequest = Pick<
  S["UpdatePolicySetRequest"],
  "name" | "description" | "entries"
>;

// ── Alerts ────────────────────────────────────────────────────────

export type AlertResponse = Pick<
  S["AlertResponse"],
  | "id"
  | "scan_id"
  | "campaign_id"
  | "policy_set_id"
  | "violation_rule_id"
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

export type SetDestinationVersionRequest = Pick<S["SetDestinationVersionRequest"], "version">;

export type SetCampaignOverridesRequest = Pick<
  S["SetCampaignOverridesRequest"],
  "mode" | "destination_ids"
>;

// ── Filters (query params, not body schemas) ──────────────────────

export interface ListScansFilters {
  readonly status?: string;
  readonly country_code?: string;
  readonly url?: string;
  readonly scan_id?: string;
  readonly date_from?: string;
  readonly date_to?: string;
  readonly tag?: string;
  readonly page: number;
  readonly limit: number;
}

export interface ListAlertsFilters {
  readonly campaign_id?: string;
  readonly status?: string;
  readonly page: number;
  readonly limit: number;
}

export interface ListUsageFilters {
  readonly date_from?: string;
  readonly date_to?: string;
  readonly scan_id?: string;
  readonly page: number;
  readonly limit: number;
}

export interface ListBalanceHistoryFilters {
  readonly date_from?: string;
  readonly date_to?: string;
  readonly page: number;
  readonly limit: number;
}

export interface PageFilters {
  readonly page: number;
  readonly limit: number;
}

export interface ListCampaignsFilters extends PageFilters {
  readonly group_id?: string;
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
  updateUserRole(
    userId: string,
    body: UpdateUserRoleRequest
  ): Promise<Result<UserResponse, ApiError>>;
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

  // Runs
  getRun(id: string): Promise<Result<RunResponse, ApiError>>;
  cancelRun(id: string): Promise<Result<CancelPendingResponse, ApiError>>;
  listRunScans(
    runId: string,
    filters: PageFilters
  ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>>;

  // Campaign groups
  listCampaignGroups(
    filters: PageFilters
  ): Promise<Result<PaginatedResponse<CampaignGroupResponse>, ApiError>>;
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
  archiveCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  unarchiveCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  pauseCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  resumeCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;

  // Tag definitions
  listTags(): Promise<Result<readonly TagDefinitionResponse[], ApiError>>;
  getTagDefinition(slug: string): Promise<Result<TagDefinitionDetailResponse, ApiError>>;
  updateTagDefinition(
    slug: string,
    body: UpdateTagDefinitionRequest
  ): Promise<Result<TagDefinitionDetailResponse, ApiError>>;
  deleteTagDefinition(slug: string): Promise<Result<null, ApiError>>;

  // Custom rules
  listCustomRules(filters: PageFilters): Promise<Result<readonly CustomRuleResponse[], ApiError>>;
  getCustomRule(id: string): Promise<Result<CustomRuleResponse, ApiError>>;
  createCustomRule(body: CreateCustomRuleRequest): Promise<Result<CustomRuleResponse, ApiError>>;
  updateCustomRule(
    id: string,
    body: UpdateCustomRuleRequest
  ): Promise<Result<CustomRuleResponse, ApiError>>;
  deleteCustomRule(id: string): Promise<Result<null, ApiError>>;
  testCustomRule(body: RuleTestRequest): Promise<Result<RuleTestResponse, ApiError>>;

  // Policy sets
  listPolicySets(): Promise<Result<readonly PolicySetResponse[], ApiError>>;
  getPolicySet(id: string): Promise<Result<PolicySetResponse, ApiError>>;
  createPolicySet(body: CreatePolicySetRequest): Promise<Result<PolicySetResponse, ApiError>>;
  updatePolicySet(
    id: string,
    body: UpdatePolicySetRequest
  ): Promise<Result<PolicySetResponse, ApiError>>;
  deletePolicySet(id: string): Promise<Result<null, ApiError>>;
  requestPolicySetApproval(id: string): Promise<Result<PolicySetResponse, ApiError>>;

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
  testWebhook(endpointId: string): Promise<Result<null, ApiError>>;
  rotateWebhookSecret(endpointId: string): Promise<Result<WebhookCreatedResponse, ApiError>>;
  listWebhookEventTypes(): Promise<Result<EventCatalogResponse, ApiError>>;
  listWebhookDeliveries(
    endpointId: string,
    filters: PageFilters
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
  listInvoices(filters: PageFilters): Promise<Result<PaginatedResponse<InvoiceResponse>, ApiError>>;

  // Alert notifications
  listAlertDestinations(): Promise<
    Result<readonly AlertNotificationDestinationResponse[], ApiError>
  >;
  deleteAlertDestination(id: string): Promise<Result<null, ApiError>>;
  setAlertDestinationVersion(
    id: string,
    body: SetDestinationVersionRequest
  ): Promise<Result<AlertNotificationDestinationResponse, ApiError>>;
  getCampaignAlertOverrides(
    campaignId: string
  ): Promise<Result<CampaignOverridesResponse, ApiError>>;
  setCampaignAlertOverrides(
    campaignId: string,
    body: SetCampaignOverridesRequest
  ): Promise<Result<CampaignOverridesResponse, ApiError>>;
}
