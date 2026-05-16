/**
 * Port: outbound calls to the Kaminari Ad `/api/v1` surface.
 *
 * Tools depend on this interface, never on `undici`, `fetch`, or any
 * other HTTP detail. The concrete `HttpApiGateway` lives in
 * `infrastructure/api/` and is built per request with the caller's
 * `Authorization`.
 *
 * As the project grows, this interface grows one method per supported
 * endpoint. The Phase 2 reference tool `get_me` defines the first
 * method; Phase 4 expands to the full v1 mirror.
 *
 * Every method returns `Result<Success, ApiError>`. Tools convert
 * `ApiError` to `ToolError` via the `apiErrorMapper` domain service.
 */

import type { Result } from "../../shared/result.js";

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
  | { readonly kind: "invalid-input"; readonly detail: string; readonly fieldErrors?: Readonly<Record<string, readonly string[]>> }
  | { readonly kind: "upstream"; readonly detail: string; readonly status?: number };

/**
 * Response shape for {@link ApiGateway.getMe}. Mirrors the API's
 * `/api/v1/account` response just enough to be useful to an agent.
 */
export interface MeResponse {
  readonly user_id: string;
  readonly organization_id: string;
  readonly email: string;
  readonly display_name: string;
  readonly permissions: readonly string[];
}

/**
 * Generic paginated envelope returned by every list endpoint.
 */
export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

/**
 * Brief scan shape returned by `GET /api/v1/scans`.
 */
export interface ScanBriefResponse {
  readonly id: string;
  readonly url: string;
  readonly country_code: string;
  readonly status: string;
  readonly created_at: string;
}

/**
 * Full scan detail returned by `GET /api/v1/scans/{id}`.
 *
 * Intentionally a narrow subset of the API's response: only the
 * fields an agent typically reads. Nested arrays (`redirect_chain`,
 * `landings`, `classification`) are omitted — they're large and rarely
 * referenced in agent workflows. Future expansion via additional tools.
 */
export interface ScanResponse {
  readonly id: string;
  readonly url: string;
  readonly country_code: string;
  readonly emulator_id: string;
  readonly status: string;
  readonly offer_url: string;
  readonly screenshot_url: string;
  readonly page_title: string;
  readonly elapsed_ms: number;
  readonly error: string;
  readonly labels: Readonly<Record<string, string>>;
  readonly campaign_id: string | null;
  readonly created_at: string;
  readonly completed_at: string | null;
}

/**
 * Request body for `POST /api/v1/scans`. Mirrors the API exactly:
 * either `url` OR `ad_tag` is required (XOR).
 */
export interface CreateScanRequest {
  readonly url?: string;
  readonly ad_tag?: string;
  readonly country_code: string;
  readonly emulator_id: string;
  readonly labels?: Readonly<Record<string, string>>;
  readonly campaign_id?: string;
  readonly run_id?: string;
}

/**
 * Request body for `POST /api/v1/scans/bulk`. URL/ad_tag XOR mirrors
 * `CreateScanRequest`; the country list expands server-side.
 */
export interface CreateBulkScansRequest {
  readonly url?: string;
  readonly ad_tag?: string;
  readonly country_codes: readonly string[];
  readonly emulator_id: string;
  readonly labels?: Readonly<Record<string, string>>;
}

/**
 * Request body for `POST /api/v1/scans/recheck`.
 */
export interface RecheckRequest {
  readonly scope_type: "last_n" | "hours";
  readonly scope_value: number;
}

export interface RecheckResponse {
  readonly queued_count: number;
}

export interface CancelPendingResponse {
  readonly cancelled_count: number;
}

/**
 * Filters accepted by `GET /api/v1/scans`. Mirrors the api repo's
 * `ScanListFilters` shape; all fields are optional and pass through
 * to the API verbatim.
 */
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

/**
 * Geo (country) entry returned by `GET /api/v1/geos`.
 */
export interface GeoResponse {
  readonly code: string;
  readonly name: string;
  readonly continent: string;
  readonly emoji: string;
}

/**
 * Campaign info — subset of fields an agent typically needs.
 *
 * Heavy fields the API exposes (`emulator_selection`, schedule details,
 * proxy details) are omitted on purpose. If an agent needs them, we
 * surface them through additional tools rather than bloating this DTO.
 */
export interface CampaignResponse {
  readonly id: string;
  readonly name: string;
  readonly campaign_type: string;
  readonly url: string;
  readonly ad_tag: string | null;
  readonly country_codes: readonly string[];
  readonly group_id: string;
  readonly labels: Readonly<Record<string, string>>;
  readonly policy_set_id: string | null;
  readonly schedule_enabled: boolean;
  readonly is_archived: boolean;
  readonly created_at: string;
  readonly last_run_at: string | null;
}

/**
 * Request body for `POST /api/v1/campaigns`. Subset of fields that
 * cover the common create flow; the API still validates everything.
 */
export interface CreateCampaignRequest {
  readonly name: string;
  readonly campaign_type: "url" | "ad_tag";
  readonly url?: string;
  readonly ad_tag?: string;
  readonly country_codes: readonly string[];
  readonly group_id?: string;
  readonly emulator_categories?: readonly string[];
  readonly labels?: Readonly<Record<string, string>>;
  readonly policy_set_id?: string;
  readonly schedule_enabled?: boolean;
}

/**
 * Request body for `PATCH /api/v1/campaigns/{id}`. All fields optional;
 * only present fields are updated.
 */
export interface UpdateCampaignRequest {
  readonly name?: string;
  readonly country_codes?: readonly string[];
  readonly labels?: Readonly<Record<string, string>>;
  readonly policy_set_id?: string | null;
  readonly schedule_enabled?: boolean;
}

export interface RunResponse {
  readonly id: string;
  readonly campaign_id: string;
  readonly label: string;
  readonly total: number;
  readonly completed: number;
  readonly failed: number;
  readonly partial: number;
  readonly cancelled: number;
  readonly source: string;
  readonly created_at: string;
}

export interface ListRunsFilters {
  readonly campaign_id?: string;
  readonly page: number;
  readonly limit: number;
}

export interface CampaignGroupResponse {
  readonly id: string;
  readonly name: string;
  readonly is_default: boolean;
  readonly is_archived: boolean;
  readonly schedule_paused: boolean;
  readonly created_at: string;
  readonly campaign_count: number | null;
}

export interface CreateCampaignGroupRequest {
  readonly name: string;
}

export interface UpdateCampaignGroupRequest {
  readonly name?: string;
  readonly schedule_paused?: boolean;
}

export interface EmulatorResponse {
  readonly id: string;
  readonly display_name: string;
  readonly category: string;
  readonly browser: string;
}

export interface TagDefinitionResponse {
  readonly slug: string;
  readonly category: string;
  readonly source: string;
  readonly display_name: string;
  readonly description: string;
  readonly is_system: boolean;
  readonly severity: string;
  readonly scans_count: number;
  readonly rules_count: number;
}

export interface CustomRuleResponse {
  readonly id: string;
  readonly name: string;
  readonly tag_slug: string;
  readonly rule_type: string;
  readonly config: Readonly<Record<string, unknown>>;
  readonly target: string;
  readonly is_active: boolean;
  readonly created_at: string;
}

export interface CreateCustomRuleRequest {
  readonly name: string;
  readonly tag_slug?: string;
  readonly rule_type: string;
  readonly config: Readonly<Record<string, unknown>>;
  readonly target?: string;
}

export interface PolicySetSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly visibility: string;
  readonly is_approved: boolean;
  readonly created_at: string;
}

export interface PolicyEntry {
  readonly tag_slug: string;
  readonly country_codes: readonly string[];
}

export interface PolicySetResponse extends PolicySetSummary {
  readonly entries: readonly PolicyEntry[];
}

export interface CreatePolicySetRequest {
  readonly name: string;
  readonly description?: string;
  readonly entries: readonly PolicyEntry[];
}

export interface AlertResponse {
  readonly id: string;
  readonly scan_id: string;
  readonly campaign_id: string;
  readonly policy_set_id: string | null;
  readonly tag_slug: string;
  readonly tag_display_name: string;
  readonly country_code: string;
  readonly status: string;
  readonly scan_url: string;
  readonly offer_url: string;
  readonly created_at: string;
}

export interface ListAlertsFilters {
  readonly campaign_id?: string;
  readonly status?: string;
  readonly page: number;
  readonly limit: number;
}

export interface WebhookResponse {
  readonly id: string;
  readonly url: string;
  readonly event_types: readonly string[];
  readonly is_active: boolean;
  readonly created_at: string;
}

export interface WebhookCreatedResponse extends WebhookResponse {
  readonly signing_secret: string;
}

export interface CreateWebhookRequest {
  readonly url: string;
  readonly event_types: readonly string[];
  readonly is_active?: boolean;
}

export interface BillingSummaryResponse {
  readonly balance_micros: number;
  readonly plan_name: string | null;
  readonly checks_per_period: number | null;
  readonly checks_used: number | null;
  readonly period_start: string | null;
  readonly period_end: string | null;
  readonly is_suspended: boolean;
  readonly can_create_scan: boolean;
  readonly block_reason: string | null;
  readonly billing_mode: string;
}

export interface ApiKeyResponse {
  readonly id: string;
  readonly key_prefix: string;
  readonly name: string;
  readonly expires_at: string | null;
  readonly created_at: string;
}

/**
 * Response from `POST /api/v1/account/api-keys`. Includes `full_key`
 * (the secret) — returned exactly once on creation; the server stores
 * only a hash thereafter.
 */
export interface ApiKeyCreatedResponse extends ApiKeyResponse {
  readonly full_key: string;
}

export interface CreateApiKeyRequest {
  readonly name: string;
  readonly expires_at?: string;
}

export interface OrgResponse {
  readonly id: string;
  readonly name: string;
  readonly created_at: string;
  readonly settings: Readonly<Record<string, unknown>>;
}

export interface UpdateOrgRequest {
  readonly name?: string;
  readonly settings?: Readonly<Record<string, unknown>>;
}

export interface OrgUserResponse {
  readonly id: string;
  readonly email: string;
  readonly display_name: string;
  readonly role: string;
  readonly is_owner: boolean;
  readonly created_at: string;
}

export interface InviteUserRequest {
  readonly email: string;
  readonly role: string;
}

export interface UpdateUserRoleRequest {
  readonly role: string;
}

export interface OrgRoleResponse {
  readonly id: string;
  readonly name: string;
  readonly is_system: boolean;
  readonly permissions: readonly string[];
}

export interface RunCommandResponse {
  readonly run_id: string;
}

export interface ArchiveOrCancelResponse {
  readonly id: string;
  readonly affected_count: number;
}

export interface TagDefinitionWithDetailResponse extends TagDefinitionResponse {
  readonly organization_id: string | null;
  readonly show_in_public_report: boolean;
}

export interface UpdateTagDefinitionRequest {
  readonly display_name?: string;
  readonly description?: string;
  readonly severity?: string;
  readonly show_in_public_report?: boolean;
}

export interface ScanTagResponse {
  readonly slug: string;
  readonly display_name: string;
  readonly category: string;
  readonly severity: string;
  readonly source: string;
}

export interface UpdateCustomRuleRequest {
  readonly name?: string;
  readonly tag_slug?: string;
  readonly rule_type?: string;
  readonly config?: Readonly<Record<string, unknown>>;
  readonly target?: string;
  readonly is_active?: boolean;
}

export interface TestCustomRuleRequest {
  readonly rule_type: string;
  readonly config: Readonly<Record<string, unknown>>;
  readonly target: string;
  readonly scan_id: string;
}

export interface TestCustomRuleResponse {
  readonly matched: boolean;
  readonly details: Readonly<Record<string, unknown>>;
}

export interface UpdatePolicySetRequest {
  readonly name?: string;
  readonly description?: string;
  readonly entries?: readonly PolicyEntry[];
}

export interface UpdateAlertStatusRequest {
  readonly status: "open" | "ack" | "resolved" | "ignored";
}

export interface AlertStatsResponse {
  readonly open: number;
  readonly ack: number;
  readonly resolved: number;
  readonly ignored: number;
  readonly total: number;
}

export interface UsageResponse {
  readonly id: string;
  readonly scan_id: string;
  readonly cost_micros: number;
  readonly kind: string;
  readonly created_at: string;
}

export interface UsagePeriodSummaryResponse {
  readonly total_micros: number;
  readonly checks_count: number;
  readonly period_start: string | null;
  readonly period_end: string | null;
}

export interface BalanceTransactionResponse {
  readonly id: string;
  readonly type: string;
  readonly amount_micros: number;
  readonly description: string;
  readonly created_at: string;
}

export interface ListUsageFilters {
  readonly date_from?: string;
  readonly date_to?: string;
  readonly scan_id?: string;
  readonly page: number;
  readonly limit: number;
}

export interface InvoiceResponse {
  readonly id: string;
  readonly number: string;
  readonly status: string;
  readonly total_micros: number;
  readonly currency: string;
  readonly issued_at: string;
  readonly due_at: string | null;
  readonly paid_at: string | null;
}

export interface UpdateWebhookRequest {
  readonly url?: string;
  readonly event_types?: readonly string[];
  readonly is_active?: boolean;
}

export interface WebhookDeliveryAttemptResponse {
  readonly id: string;
  readonly endpoint_id: string;
  readonly event_type: string;
  readonly status: string;
  readonly response_status: number | null;
  readonly attempted_at: string;
}

export interface WebhookEventCatalogEntry {
  readonly type: string;
  readonly description: string;
}

export interface AlertNotificationDestination {
  readonly id: string;
  readonly kind: string;
  readonly name: string;
  readonly version: number;
  readonly created_at: string;
}

export interface CampaignAlertOverrides {
  readonly campaign_id: string;
  readonly destination_ids: readonly string[];
  readonly muted: boolean;
}

export interface SetCampaignOverridesRequest {
  readonly destination_ids: readonly string[];
  readonly muted: boolean;
}

export interface ApiGateway {
  // ── Account ───────────────────────────────────────────────────
  /** `GET /api/v1/account` — current authenticated principal. */
  getMe(): Promise<Result<MeResponse, ApiError>>;

  // ── Scans ─────────────────────────────────────────────────────
  /** `GET /api/v1/scans` — filtered, paginated list of scans. */
  listScans(
    filters: ListScansFilters
  ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>>;
  /** `GET /api/v1/scans/{id}` — full scan detail. */
  getScan(scanId: string): Promise<Result<ScanResponse, ApiError>>;
  /** `POST /api/v1/scans` — create one scan. Costs credits. */
  createScan(body: CreateScanRequest): Promise<Result<ScanResponse, ApiError>>;
  /** `POST /api/v1/scans/bulk` — create N scans across countries. */
  createBulkScans(body: CreateBulkScansRequest): Promise<Result<readonly ScanResponse[], ApiError>>;
  /** `POST /api/v1/scans/recheck` — re-queue completed scans. */
  recheckScans(body: RecheckRequest): Promise<Result<RecheckResponse, ApiError>>;
  /** `POST /api/v1/scans/{id}/cancel` — cancel a single pending scan. */
  cancelScan(scanId: string): Promise<Result<CancelPendingResponse, ApiError>>;

  // ── Geos ──────────────────────────────────────────────────────
  /** `GET /api/v1/geos` — all supported countries. */
  listGeos(): Promise<Result<readonly GeoResponse[], ApiError>>;

  // ── Campaigns ─────────────────────────────────────────────────
  listCampaigns(filters: {
    readonly group_id?: string;
    readonly page: number;
    readonly limit: number;
  }): Promise<Result<PaginatedResponse<CampaignResponse>, ApiError>>;
  getCampaign(id: string): Promise<Result<CampaignResponse, ApiError>>;
  createCampaign(body: CreateCampaignRequest): Promise<Result<CampaignResponse, ApiError>>;
  updateCampaign(
    id: string,
    body: UpdateCampaignRequest
  ): Promise<Result<CampaignResponse, ApiError>>;
  archiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>>;

  // ── Runs ──────────────────────────────────────────────────────
  listRuns(filters: ListRunsFilters): Promise<Result<PaginatedResponse<RunResponse>, ApiError>>;
  getRun(id: string): Promise<Result<RunResponse, ApiError>>;

  // ── Campaign groups ───────────────────────────────────────────
  listCampaignGroups(filters: {
    readonly page: number;
    readonly limit: number;
  }): Promise<Result<PaginatedResponse<CampaignGroupResponse>, ApiError>>;
  getCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  createCampaignGroup(
    body: CreateCampaignGroupRequest
  ): Promise<Result<CampaignGroupResponse, ApiError>>;
  updateCampaignGroup(
    id: string,
    body: UpdateCampaignGroupRequest
  ): Promise<Result<CampaignGroupResponse, ApiError>>;

  // ── Emulators ─────────────────────────────────────────────────
  listEmulators(): Promise<Result<readonly EmulatorResponse[], ApiError>>;

  // ── Tags (checking) ───────────────────────────────────────────
  listTags(filters: {
    readonly category?: string;
    readonly page: number;
    readonly limit: number;
  }): Promise<Result<PaginatedResponse<TagDefinitionResponse>, ApiError>>;

  // ── Custom rules ──────────────────────────────────────────────
  listCustomRules(filters: {
    readonly page: number;
    readonly limit: number;
  }): Promise<Result<PaginatedResponse<CustomRuleResponse>, ApiError>>;
  createCustomRule(body: CreateCustomRuleRequest): Promise<Result<CustomRuleResponse, ApiError>>;
  deleteCustomRule(id: string): Promise<Result<null, ApiError>>;

  // ── Policy sets ───────────────────────────────────────────────
  listPolicySets(): Promise<Result<readonly PolicySetSummary[], ApiError>>;
  getPolicySet(id: string): Promise<Result<PolicySetResponse, ApiError>>;
  createPolicySet(body: CreatePolicySetRequest): Promise<Result<PolicySetResponse, ApiError>>;

  // ── Alerts ────────────────────────────────────────────────────
  listAlerts(
    filters: ListAlertsFilters
  ): Promise<Result<PaginatedResponse<AlertResponse>, ApiError>>;

  // ── Webhooks ──────────────────────────────────────────────────
  listWebhooks(): Promise<Result<readonly WebhookResponse[], ApiError>>;
  createWebhook(body: CreateWebhookRequest): Promise<Result<WebhookCreatedResponse, ApiError>>;
  deleteWebhook(id: string): Promise<Result<null, ApiError>>;

  // ── Billing ───────────────────────────────────────────────────
  getBillingSummary(): Promise<Result<BillingSummaryResponse, ApiError>>;

  // ── Account: org + members + api-keys ─────────────────────────
  updateOrg(body: UpdateOrgRequest): Promise<Result<OrgResponse, ApiError>>;
  listOrgUsers(): Promise<Result<readonly OrgUserResponse[], ApiError>>;
  inviteUser(body: InviteUserRequest): Promise<Result<OrgUserResponse, ApiError>>;
  updateUserRole(
    userId: string,
    body: UpdateUserRoleRequest
  ): Promise<Result<OrgUserResponse, ApiError>>;
  removeUser(userId: string): Promise<Result<null, ApiError>>;
  transferOwnership(userId: string): Promise<Result<null, ApiError>>;
  listOrgRoles(): Promise<Result<readonly OrgRoleResponse[], ApiError>>;
  listApiKeys(): Promise<Result<readonly ApiKeyResponse[], ApiError>>;
  createApiKey(body: CreateApiKeyRequest): Promise<Result<ApiKeyCreatedResponse, ApiError>>;
  revokeApiKey(keyId: string): Promise<Result<null, ApiError>>;

  // ── Scans: extra read ─────────────────────────────────────────
  listRunScans(
    runId: string,
    filters: { readonly page: number; readonly limit: number }
  ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>>;

  // ── Tags: per-scan + CRUD on definitions ──────────────────────
  listScanTags(scanId: string): Promise<Result<readonly ScanTagResponse[], ApiError>>;
  getTagDefinition(
    slug: string
  ): Promise<Result<TagDefinitionWithDetailResponse, ApiError>>;
  updateTagDefinition(
    slug: string,
    body: UpdateTagDefinitionRequest
  ): Promise<Result<TagDefinitionWithDetailResponse, ApiError>>;
  deleteTagDefinition(slug: string): Promise<Result<null, ApiError>>;

  // ── Custom rules: extra CRUD ──────────────────────────────────
  getCustomRule(id: string): Promise<Result<CustomRuleResponse, ApiError>>;
  updateCustomRule(
    id: string,
    body: UpdateCustomRuleRequest
  ): Promise<Result<CustomRuleResponse, ApiError>>;
  testCustomRule(
    body: TestCustomRuleRequest
  ): Promise<Result<TestCustomRuleResponse, ApiError>>;

  // ── Policy sets: extra CRUD ───────────────────────────────────
  updatePolicySet(
    id: string,
    body: UpdatePolicySetRequest
  ): Promise<Result<PolicySetResponse, ApiError>>;
  deletePolicySet(id: string): Promise<Result<null, ApiError>>;
  requestPolicySetApproval(id: string): Promise<Result<PolicySetResponse, ApiError>>;

  // ── Alerts: stats + status update ─────────────────────────────
  updateAlertStatus(
    alertId: string,
    body: UpdateAlertStatusRequest
  ): Promise<Result<null, ApiError>>;
  getAlertStats(): Promise<Result<AlertStatsResponse, ApiError>>;

  // ── Campaign lifecycle ────────────────────────────────────────
  runCampaign(id: string): Promise<Result<RunCommandResponse, ApiError>>;
  cancelCampaign(id: string): Promise<Result<ArchiveOrCancelResponse, ApiError>>;
  unarchiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>>;
  listCampaignRuns(
    campaignId: string,
    filters: { readonly page: number; readonly limit: number }
  ): Promise<Result<PaginatedResponse<RunResponse>, ApiError>>;

  // ── Group lifecycle ───────────────────────────────────────────
  runCampaignGroup(id: string): Promise<Result<RunCommandResponse, ApiError>>;
  cancelCampaignGroup(id: string): Promise<Result<ArchiveOrCancelResponse, ApiError>>;
  archiveCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  unarchiveCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  pauseCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;
  resumeCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>>;

  // ── Runs: cancel ──────────────────────────────────────────────
  cancelRun(id: string): Promise<Result<ArchiveOrCancelResponse, ApiError>>;

  // ── Billing: extra reads ──────────────────────────────────────
  listUsage(
    filters: ListUsageFilters
  ): Promise<Result<PaginatedResponse<UsageResponse>, ApiError>>;
  getUsageSummary(): Promise<Result<UsagePeriodSummaryResponse, ApiError>>;
  listBalanceHistory(filters: {
    readonly date_from?: string;
    readonly date_to?: string;
    readonly page: number;
    readonly limit: number;
  }): Promise<Result<PaginatedResponse<BalanceTransactionResponse>, ApiError>>;

  // ── Invoicing ─────────────────────────────────────────────────
  listInvoices(filters: {
    readonly page: number;
    readonly limit: number;
  }): Promise<Result<PaginatedResponse<InvoiceResponse>, ApiError>>;

  // ── Webhooks: extras ──────────────────────────────────────────
  getWebhook(id: string): Promise<Result<WebhookResponse, ApiError>>;
  updateWebhook(
    id: string,
    body: UpdateWebhookRequest
  ): Promise<Result<WebhookResponse, ApiError>>;
  listWebhookEventTypes(): Promise<Result<readonly WebhookEventCatalogEntry[], ApiError>>;
  listWebhookDeliveries(
    endpointId: string,
    filters: { readonly page: number; readonly limit: number }
  ): Promise<Result<PaginatedResponse<WebhookDeliveryAttemptResponse>, ApiError>>;
  testWebhook(endpointId: string): Promise<Result<null, ApiError>>;
  rotateWebhookSecret(endpointId: string): Promise<Result<WebhookCreatedResponse, ApiError>>;
  replayWebhookDelivery(attemptId: string): Promise<Result<null, ApiError>>;
  bulkReplayWebhook(
    endpointId: string,
    body: { readonly attempt_ids?: readonly string[] }
  ): Promise<Result<{ readonly replayed_count: number }, ApiError>>;

  // ── Alert notifications ───────────────────────────────────────
  listAlertDestinations(): Promise<Result<readonly AlertNotificationDestination[], ApiError>>;
  deleteAlertDestination(id: string): Promise<Result<null, ApiError>>;
  setAlertDestinationVersion(
    id: string,
    body: { readonly version: number }
  ): Promise<Result<AlertNotificationDestination, ApiError>>;
  getCampaignAlertOverrides(
    campaignId: string
  ): Promise<Result<CampaignAlertOverrides, ApiError>>;
  setCampaignAlertOverrides(
    campaignId: string,
    body: SetCampaignOverridesRequest
  ): Promise<Result<CampaignAlertOverrides, ApiError>>;
}
