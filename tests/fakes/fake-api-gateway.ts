/**
 * Recording-spy fake for the `ApiGateway` port.
 *
 * Each method returns a pre-configured `Result` and pushes its call into
 * a `calls` array so tests can assert on what was invoked. ZERO business
 * logic — never reimplement the API's filtering / matching / validation
 * inside a fake.
 */

import type {
  AlertNotificationDestination,
  AlertResponse,
  AlertStatsResponse,
  ApiError,
  ApiGateway,
  ApiKeyCreatedResponse,
  ApiKeyResponse,
  ArchiveOrCancelResponse,
  BalanceTransactionResponse,
  BillingSummaryResponse,
  CampaignAlertOverrides,
  CampaignGroupResponse,
  CampaignResponse,
  CancelPendingResponse,
  CreateApiKeyRequest,
  CreateBulkScansRequest,
  CreateCampaignGroupRequest,
  CreateCampaignRequest,
  CreateCustomRuleRequest,
  CreatePolicySetRequest,
  CreateScanRequest,
  CreateWebhookRequest,
  CustomRuleResponse,
  EmulatorResponse,
  GeoResponse,
  InviteUserRequest,
  InvoiceResponse,
  ListAlertsFilters,
  ListRunsFilters,
  ListScansFilters,
  ListUsageFilters,
  MeResponse,
  OrgResponse,
  OrgRoleResponse,
  OrgUserResponse,
  PaginatedResponse,
  PolicySetResponse,
  PolicySetSummary,
  RecheckRequest,
  RecheckResponse,
  RunCommandResponse,
  RunResponse,
  ScanBriefResponse,
  ScanResponse,
  ScanTagResponse,
  SetCampaignOverridesRequest,
  TagDefinitionResponse,
  TagDefinitionWithDetailResponse,
  TestCustomRuleRequest,
  TestCustomRuleResponse,
  UpdateAlertStatusRequest,
  UpdateCampaignGroupRequest,
  UpdateCampaignRequest,
  UpdateCustomRuleRequest,
  UpdateOrgRequest,
  UpdatePolicySetRequest,
  UpdateTagDefinitionRequest,
  UpdateUserRoleRequest,
  UpdateWebhookRequest,
  UsagePeriodSummaryResponse,
  UsageResponse,
  WebhookCreatedResponse,
  WebhookDeliveryAttemptResponse,
  WebhookEventCatalogEntry,
  WebhookResponse,
} from "../../src/domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../src/shared/result.js";

type Call =
  | { readonly method: "getMe" }
  | { readonly method: "listScans"; readonly filters: ListScansFilters }
  | { readonly method: "getScan"; readonly scanId: string }
  | { readonly method: "createScan"; readonly body: CreateScanRequest }
  | { readonly method: "createBulkScans"; readonly body: CreateBulkScansRequest }
  | { readonly method: "recheckScans"; readonly body: RecheckRequest }
  | { readonly method: "cancelScan"; readonly scanId: string }
  | { readonly method: "listGeos" }
  | { readonly method: "listCampaigns"; readonly filters: { page: number; limit: number; group_id?: string } }
  | { readonly method: "getCampaign"; readonly id: string }
  | { readonly method: "createCampaign"; readonly body: CreateCampaignRequest }
  | { readonly method: "updateCampaign"; readonly id: string; readonly body: UpdateCampaignRequest }
  | { readonly method: "archiveCampaign"; readonly id: string }
  | { readonly method: "listRuns"; readonly filters: ListRunsFilters }
  | { readonly method: "getRun"; readonly id: string }
  | { readonly method: "listCampaignGroups"; readonly filters: { page: number; limit: number } }
  | { readonly method: "getCampaignGroup"; readonly id: string }
  | { readonly method: "createCampaignGroup"; readonly body: CreateCampaignGroupRequest }
  | { readonly method: "updateCampaignGroup"; readonly id: string; readonly body: UpdateCampaignGroupRequest }
  | { readonly method: "listEmulators" }
  | { readonly method: "listTags"; readonly filters: { page: number; limit: number; category?: string } }
  | { readonly method: "listCustomRules"; readonly filters: { page: number; limit: number } }
  | { readonly method: "createCustomRule"; readonly body: CreateCustomRuleRequest }
  | { readonly method: "deleteCustomRule"; readonly id: string }
  | { readonly method: "listPolicySets" }
  | { readonly method: "getPolicySet"; readonly id: string }
  | { readonly method: "createPolicySet"; readonly body: CreatePolicySetRequest }
  | { readonly method: "listAlerts"; readonly filters: ListAlertsFilters }
  | { readonly method: "listWebhooks" }
  | { readonly method: "createWebhook"; readonly body: CreateWebhookRequest }
  | { readonly method: "deleteWebhook"; readonly id: string }
  | { readonly method: "getBillingSummary" }
  | { readonly method: "listApiKeys" }
  | { readonly method: "createApiKey"; readonly body: CreateApiKeyRequest }
  | { readonly method: "revokeApiKey"; readonly id: string }
  | { readonly method: "updateOrg"; readonly body: UpdateOrgRequest }
  | { readonly method: "listOrgUsers" }
  | { readonly method: "inviteUser"; readonly body: InviteUserRequest }
  | { readonly method: "updateUserRole"; readonly userId: string; readonly body: UpdateUserRoleRequest }
  | { readonly method: "removeUser"; readonly userId: string }
  | { readonly method: "transferOwnership"; readonly userId: string }
  | { readonly method: "listOrgRoles" }
  | { readonly method: "listRunScans"; readonly runId: string; readonly filters: { page: number; limit: number } }
  | { readonly method: "listScanTags"; readonly scanId: string }
  | { readonly method: "getTagDefinition"; readonly slug: string }
  | { readonly method: "updateTagDefinition"; readonly slug: string; readonly body: UpdateTagDefinitionRequest }
  | { readonly method: "deleteTagDefinition"; readonly slug: string }
  | { readonly method: "getCustomRule"; readonly id: string }
  | { readonly method: "updateCustomRule"; readonly id: string; readonly body: UpdateCustomRuleRequest }
  | { readonly method: "testCustomRule"; readonly body: TestCustomRuleRequest }
  | { readonly method: "updatePolicySet"; readonly id: string; readonly body: UpdatePolicySetRequest }
  | { readonly method: "deletePolicySet"; readonly id: string }
  | { readonly method: "requestPolicySetApproval"; readonly id: string }
  | { readonly method: "updateAlertStatus"; readonly alertId: string; readonly body: UpdateAlertStatusRequest }
  | { readonly method: "getAlertStats" }
  | { readonly method: "runCampaign"; readonly id: string }
  | { readonly method: "cancelCampaign"; readonly id: string }
  | { readonly method: "unarchiveCampaign"; readonly id: string }
  | { readonly method: "listCampaignRuns"; readonly campaignId: string; readonly filters: { page: number; limit: number } }
  | { readonly method: "runCampaignGroup"; readonly id: string }
  | { readonly method: "cancelCampaignGroup"; readonly id: string }
  | { readonly method: "archiveCampaignGroup"; readonly id: string }
  | { readonly method: "unarchiveCampaignGroup"; readonly id: string }
  | { readonly method: "pauseCampaignGroupSchedule"; readonly id: string }
  | { readonly method: "resumeCampaignGroupSchedule"; readonly id: string }
  | { readonly method: "cancelRun"; readonly id: string }
  | { readonly method: "listUsage"; readonly filters: ListUsageFilters }
  | { readonly method: "getUsageSummary" }
  | { readonly method: "listBalanceHistory"; readonly filters: { page: number; limit: number; date_from?: string; date_to?: string } }
  | { readonly method: "listInvoices"; readonly filters: { page: number; limit: number } }
  | { readonly method: "getWebhook"; readonly id: string }
  | { readonly method: "updateWebhook"; readonly id: string; readonly body: UpdateWebhookRequest }
  | { readonly method: "listWebhookEventTypes" }
  | { readonly method: "listWebhookDeliveries"; readonly endpointId: string; readonly filters: { page: number; limit: number } }
  | { readonly method: "testWebhook"; readonly endpointId: string }
  | { readonly method: "rotateWebhookSecret"; readonly endpointId: string }
  | { readonly method: "replayWebhookDelivery"; readonly attemptId: string }
  | { readonly method: "bulkReplayWebhook"; readonly endpointId: string; readonly body: { attempt_ids?: readonly string[] } }
  | { readonly method: "listAlertDestinations" }
  | { readonly method: "deleteAlertDestination"; readonly id: string }
  | { readonly method: "setAlertDestinationVersion"; readonly id: string; readonly body: { version: number } }
  | { readonly method: "getCampaignAlertOverrides"; readonly campaignId: string }
  | { readonly method: "setCampaignAlertOverrides"; readonly campaignId: string; readonly body: SetCampaignOverridesRequest };

export interface FakeApiGatewayState {
  readonly calls: Call[];
  responses: {
    getMe?: Result<MeResponse, ApiError>;
    listScans?: Result<PaginatedResponse<ScanBriefResponse>, ApiError>;
    getScan?: Result<ScanResponse, ApiError>;
    createScan?: Result<ScanResponse, ApiError>;
    createBulkScans?: Result<readonly ScanResponse[], ApiError>;
    recheckScans?: Result<RecheckResponse, ApiError>;
    cancelScan?: Result<CancelPendingResponse, ApiError>;
    listGeos?: Result<readonly GeoResponse[], ApiError>;
    listCampaigns?: Result<PaginatedResponse<CampaignResponse>, ApiError>;
    getCampaign?: Result<CampaignResponse, ApiError>;
    createCampaign?: Result<CampaignResponse, ApiError>;
    updateCampaign?: Result<CampaignResponse, ApiError>;
    archiveCampaign?: Result<CampaignResponse, ApiError>;
    listRuns?: Result<PaginatedResponse<RunResponse>, ApiError>;
    getRun?: Result<RunResponse, ApiError>;
    listCampaignGroups?: Result<PaginatedResponse<CampaignGroupResponse>, ApiError>;
    getCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    createCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    updateCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    listEmulators?: Result<readonly EmulatorResponse[], ApiError>;
    listTags?: Result<PaginatedResponse<TagDefinitionResponse>, ApiError>;
    listCustomRules?: Result<PaginatedResponse<CustomRuleResponse>, ApiError>;
    createCustomRule?: Result<CustomRuleResponse, ApiError>;
    deleteCustomRule?: Result<null, ApiError>;
    listPolicySets?: Result<readonly PolicySetSummary[], ApiError>;
    getPolicySet?: Result<PolicySetResponse, ApiError>;
    createPolicySet?: Result<PolicySetResponse, ApiError>;
    listAlerts?: Result<PaginatedResponse<AlertResponse>, ApiError>;
    listWebhooks?: Result<readonly WebhookResponse[], ApiError>;
    createWebhook?: Result<WebhookCreatedResponse, ApiError>;
    deleteWebhook?: Result<null, ApiError>;
    getBillingSummary?: Result<BillingSummaryResponse, ApiError>;
    listApiKeys?: Result<readonly ApiKeyResponse[], ApiError>;
    createApiKey?: Result<ApiKeyCreatedResponse, ApiError>;
    revokeApiKey?: Result<null, ApiError>;
    updateOrg?: Result<OrgResponse, ApiError>;
    listOrgUsers?: Result<readonly OrgUserResponse[], ApiError>;
    inviteUser?: Result<OrgUserResponse, ApiError>;
    updateUserRole?: Result<OrgUserResponse, ApiError>;
    removeUser?: Result<null, ApiError>;
    transferOwnership?: Result<null, ApiError>;
    listOrgRoles?: Result<readonly OrgRoleResponse[], ApiError>;
    listRunScans?: Result<PaginatedResponse<ScanBriefResponse>, ApiError>;
    listScanTags?: Result<readonly ScanTagResponse[], ApiError>;
    getTagDefinition?: Result<TagDefinitionWithDetailResponse, ApiError>;
    updateTagDefinition?: Result<TagDefinitionWithDetailResponse, ApiError>;
    deleteTagDefinition?: Result<null, ApiError>;
    getCustomRule?: Result<CustomRuleResponse, ApiError>;
    updateCustomRule?: Result<CustomRuleResponse, ApiError>;
    testCustomRule?: Result<TestCustomRuleResponse, ApiError>;
    updatePolicySet?: Result<PolicySetResponse, ApiError>;
    deletePolicySet?: Result<null, ApiError>;
    requestPolicySetApproval?: Result<PolicySetResponse, ApiError>;
    updateAlertStatus?: Result<null, ApiError>;
    getAlertStats?: Result<AlertStatsResponse, ApiError>;
    runCampaign?: Result<RunCommandResponse, ApiError>;
    cancelCampaign?: Result<ArchiveOrCancelResponse, ApiError>;
    unarchiveCampaign?: Result<CampaignResponse, ApiError>;
    listCampaignRuns?: Result<PaginatedResponse<RunResponse>, ApiError>;
    runCampaignGroup?: Result<RunCommandResponse, ApiError>;
    cancelCampaignGroup?: Result<ArchiveOrCancelResponse, ApiError>;
    archiveCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    unarchiveCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    pauseCampaignGroupSchedule?: Result<CampaignGroupResponse, ApiError>;
    resumeCampaignGroupSchedule?: Result<CampaignGroupResponse, ApiError>;
    cancelRun?: Result<ArchiveOrCancelResponse, ApiError>;
    listUsage?: Result<PaginatedResponse<UsageResponse>, ApiError>;
    getUsageSummary?: Result<UsagePeriodSummaryResponse, ApiError>;
    listBalanceHistory?: Result<PaginatedResponse<BalanceTransactionResponse>, ApiError>;
    listInvoices?: Result<PaginatedResponse<InvoiceResponse>, ApiError>;
    getWebhook?: Result<WebhookResponse, ApiError>;
    updateWebhook?: Result<WebhookResponse, ApiError>;
    listWebhookEventTypes?: Result<readonly WebhookEventCatalogEntry[], ApiError>;
    listWebhookDeliveries?: Result<PaginatedResponse<WebhookDeliveryAttemptResponse>, ApiError>;
    testWebhook?: Result<null, ApiError>;
    rotateWebhookSecret?: Result<WebhookCreatedResponse, ApiError>;
    replayWebhookDelivery?: Result<null, ApiError>;
    bulkReplayWebhook?: Result<{ readonly replayed_count: number }, ApiError>;
    listAlertDestinations?: Result<readonly AlertNotificationDestination[], ApiError>;
    deleteAlertDestination?: Result<null, ApiError>;
    setAlertDestinationVersion?: Result<AlertNotificationDestination, ApiError>;
    getCampaignAlertOverrides?: Result<CampaignAlertOverrides, ApiError>;
    setCampaignAlertOverrides?: Result<CampaignAlertOverrides, ApiError>;
  };
}

const DEFAULT_ME: MeResponse = {
  user_id: "00000000-0000-0000-0000-000000000001",
  organization_id: "00000000-0000-0000-0000-000000000010",
  email: "test@example.com",
  display_name: "Test User",
  permissions: [],
};

const DEFAULT_SCAN: ScanResponse = {
  id: "00000000-0000-0000-0000-000000000aaa",
  url: "https://ad.example/a",
  country_code: "US",
  emulator_id: "default",
  status: "done",
  offer_url: "https://offer.example",
  screenshot_url: "",
  page_title: "",
  elapsed_ms: 1000,
  error: "",
  labels: {},
  campaign_id: null,
  created_at: "2026-05-16T12:00:00Z",
  completed_at: "2026-05-16T12:00:01Z",
};

const DEFAULT_CAMPAIGN: CampaignResponse = {
  id: "00000000-0000-0000-0000-000000000ccc",
  name: "Test Campaign",
  campaign_type: "url",
  url: "https://ad.example",
  ad_tag: null,
  country_codes: ["US"],
  group_id: "00000000-0000-0000-0000-000000000ggg".replace(/g/g, "1"),
  labels: {},
  policy_set_id: null,
  schedule_enabled: false,
  is_archived: false,
  created_at: "2026-05-16T00:00:00Z",
  last_run_at: null,
};

const DEFAULT_GROUP: CampaignGroupResponse = {
  id: "00000000-0000-0000-0000-000000000111",
  name: "default",
  is_default: true,
  is_archived: false,
  schedule_paused: false,
  created_at: "2026-05-16T00:00:00Z",
  campaign_count: 0,
};

const DEFAULT_RUN: RunResponse = {
  id: "00000000-0000-0000-0000-000000000222",
  campaign_id: DEFAULT_CAMPAIGN.id,
  label: "run-1",
  total: 10,
  completed: 10,
  failed: 0,
  partial: 0,
  cancelled: 0,
  source: "scheduled",
  created_at: "2026-05-16T00:00:00Z",
};

export function createFakeApiGateway(): ApiGateway & { readonly state: FakeApiGatewayState } {
  const state: FakeApiGatewayState = { calls: [], responses: {} };

  function push(call: Call): void {
    (state.calls as Call[]).push(call);
  }

  return {
    state,
    async getMe(): Promise<Result<MeResponse, ApiError>> {
      push({ method: "getMe" });
      await Promise.resolve();
      return state.responses.getMe ?? ok<MeResponse, ApiError>(DEFAULT_ME);
    },
    async listScans(filters) {
      push({ method: "listScans", filters });
      await Promise.resolve();
      return (
        state.responses.listScans ??
        ok<PaginatedResponse<ScanBriefResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async getScan(scanId) {
      push({ method: "getScan", scanId });
      await Promise.resolve();
      return state.responses.getScan ?? ok<ScanResponse, ApiError>(DEFAULT_SCAN);
    },
    async createScan(body) {
      push({ method: "createScan", body });
      await Promise.resolve();
      return state.responses.createScan ?? ok<ScanResponse, ApiError>(DEFAULT_SCAN);
    },
    async createBulkScans(body) {
      push({ method: "createBulkScans", body });
      await Promise.resolve();
      return (
        state.responses.createBulkScans ??
        ok<readonly ScanResponse[], ApiError>(body.country_codes.map(() => DEFAULT_SCAN))
      );
    },
    async recheckScans(body) {
      push({ method: "recheckScans", body });
      await Promise.resolve();
      return state.responses.recheckScans ?? ok<RecheckResponse, ApiError>({ queued_count: 5 });
    },
    async cancelScan(scanId) {
      push({ method: "cancelScan", scanId });
      await Promise.resolve();
      return (
        state.responses.cancelScan ?? ok<CancelPendingResponse, ApiError>({ cancelled_count: 1 })
      );
    },
    async listGeos() {
      push({ method: "listGeos" });
      await Promise.resolve();
      return state.responses.listGeos ?? ok<readonly GeoResponse[], ApiError>([]);
    },
    async listCampaigns(filters) {
      push({ method: "listCampaigns", filters });
      await Promise.resolve();
      return (
        state.responses.listCampaigns ??
        ok<PaginatedResponse<CampaignResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async getCampaign(id) {
      push({ method: "getCampaign", id });
      await Promise.resolve();
      return state.responses.getCampaign ?? ok<CampaignResponse, ApiError>(DEFAULT_CAMPAIGN);
    },
    async createCampaign(body) {
      push({ method: "createCampaign", body });
      await Promise.resolve();
      return state.responses.createCampaign ?? ok<CampaignResponse, ApiError>(DEFAULT_CAMPAIGN);
    },
    async updateCampaign(id, body) {
      push({ method: "updateCampaign", id, body });
      await Promise.resolve();
      return state.responses.updateCampaign ?? ok<CampaignResponse, ApiError>(DEFAULT_CAMPAIGN);
    },
    async archiveCampaign(id) {
      push({ method: "archiveCampaign", id });
      await Promise.resolve();
      return (
        state.responses.archiveCampaign ??
        ok<CampaignResponse, ApiError>({ ...DEFAULT_CAMPAIGN, is_archived: true })
      );
    },
    async listRuns(filters) {
      push({ method: "listRuns", filters });
      await Promise.resolve();
      return (
        state.responses.listRuns ??
        ok<PaginatedResponse<RunResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async getRun(id) {
      push({ method: "getRun", id });
      await Promise.resolve();
      return state.responses.getRun ?? ok<RunResponse, ApiError>(DEFAULT_RUN);
    },
    async listCampaignGroups(filters) {
      push({ method: "listCampaignGroups", filters });
      await Promise.resolve();
      return (
        state.responses.listCampaignGroups ??
        ok<PaginatedResponse<CampaignGroupResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async getCampaignGroup(id) {
      push({ method: "getCampaignGroup", id });
      await Promise.resolve();
      return state.responses.getCampaignGroup ?? ok<CampaignGroupResponse, ApiError>(DEFAULT_GROUP);
    },
    async createCampaignGroup(body) {
      push({ method: "createCampaignGroup", body });
      await Promise.resolve();
      return state.responses.createCampaignGroup ?? ok<CampaignGroupResponse, ApiError>(DEFAULT_GROUP);
    },
    async updateCampaignGroup(id, body) {
      push({ method: "updateCampaignGroup", id, body });
      await Promise.resolve();
      return state.responses.updateCampaignGroup ?? ok<CampaignGroupResponse, ApiError>(DEFAULT_GROUP);
    },
    async listEmulators() {
      push({ method: "listEmulators" });
      await Promise.resolve();
      return state.responses.listEmulators ?? ok<readonly EmulatorResponse[], ApiError>([]);
    },
    async listTags(filters) {
      push({ method: "listTags", filters });
      await Promise.resolve();
      return (
        state.responses.listTags ??
        ok<PaginatedResponse<TagDefinitionResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async listCustomRules(filters) {
      push({ method: "listCustomRules", filters });
      await Promise.resolve();
      return (
        state.responses.listCustomRules ??
        ok<PaginatedResponse<CustomRuleResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async createCustomRule(body) {
      push({ method: "createCustomRule", body });
      await Promise.resolve();
      return (
        state.responses.createCustomRule ??
        ok<CustomRuleResponse, ApiError>({
          id: "00000000-0000-0000-0000-000000000bbb",
          name: body.name,
          tag_slug: body.tag_slug ?? "",
          rule_type: body.rule_type,
          config: body.config,
          target: body.target ?? "page",
          is_active: true,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async deleteCustomRule(id) {
      push({ method: "deleteCustomRule", id });
      await Promise.resolve();
      return state.responses.deleteCustomRule ?? ok<null, ApiError>(null);
    },
    async listPolicySets() {
      push({ method: "listPolicySets" });
      await Promise.resolve();
      return state.responses.listPolicySets ?? ok<readonly PolicySetSummary[], ApiError>([]);
    },
    async getPolicySet(id) {
      push({ method: "getPolicySet", id });
      await Promise.resolve();
      return (
        state.responses.getPolicySet ??
        ok<PolicySetResponse, ApiError>({
          id,
          name: "default",
          description: "",
          visibility: "private",
          is_approved: true,
          created_at: "2026-05-16T00:00:00Z",
          entries: [],
        })
      );
    },
    async createPolicySet(body) {
      push({ method: "createPolicySet", body });
      await Promise.resolve();
      return (
        state.responses.createPolicySet ??
        ok<PolicySetResponse, ApiError>({
          id: "00000000-0000-0000-0000-000000000ddd",
          name: body.name,
          description: body.description ?? "",
          visibility: "private",
          is_approved: false,
          created_at: "2026-05-16T00:00:00Z",
          entries: [...body.entries],
        })
      );
    },
    async listAlerts(filters) {
      push({ method: "listAlerts", filters });
      await Promise.resolve();
      return (
        state.responses.listAlerts ??
        ok<PaginatedResponse<AlertResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async listWebhooks() {
      push({ method: "listWebhooks" });
      await Promise.resolve();
      return state.responses.listWebhooks ?? ok<readonly WebhookResponse[], ApiError>([]);
    },
    async createWebhook(body) {
      push({ method: "createWebhook", body });
      await Promise.resolve();
      return (
        state.responses.createWebhook ??
        ok<WebhookCreatedResponse, ApiError>({
          id: "00000000-0000-0000-0000-000000000eee",
          url: body.url,
          event_types: [...body.event_types],
          is_active: body.is_active ?? true,
          created_at: "2026-05-16T00:00:00Z",
          signing_secret: "whsec_abc",
        })
      );
    },
    async deleteWebhook(id) {
      push({ method: "deleteWebhook", id });
      await Promise.resolve();
      return state.responses.deleteWebhook ?? ok<null, ApiError>(null);
    },
    async getBillingSummary() {
      push({ method: "getBillingSummary" });
      await Promise.resolve();
      return (
        state.responses.getBillingSummary ??
        ok<BillingSummaryResponse, ApiError>({
          balance_micros: 0,
          plan_name: null,
          checks_per_period: null,
          checks_used: null,
          period_start: null,
          period_end: null,
          is_suspended: false,
          can_create_scan: true,
          block_reason: null,
          billing_mode: "prepaid",
        })
      );
    },
    async listApiKeys() {
      push({ method: "listApiKeys" });
      await Promise.resolve();
      return state.responses.listApiKeys ?? ok<readonly ApiKeyResponse[], ApiError>([]);
    },
    // ── Account extras ─────────────────────────────────────────
    async createApiKey(body) {
      push({ method: "createApiKey", body });
      await Promise.resolve();
      return (
        state.responses.createApiKey ??
        ok<ApiKeyCreatedResponse, ApiError>({
          id: "00000000-0000-0000-0000-000000000fff",
          key_prefix: "kad_new1",
          name: body.name,
          expires_at: body.expires_at ?? null,
          created_at: "2026-05-16T00:00:00Z",
          full_key: "kad_full_secret_test_value",
        })
      );
    },
    async revokeApiKey(id) {
      push({ method: "revokeApiKey", id });
      await Promise.resolve();
      return state.responses.revokeApiKey ?? ok<null, ApiError>(null);
    },
    async updateOrg(body) {
      push({ method: "updateOrg", body });
      await Promise.resolve();
      return (
        state.responses.updateOrg ??
        ok<OrgResponse, ApiError>({
          id: "00000000-0000-0000-0000-000000000010",
          name: body.name ?? "Test Org",
          created_at: "2026-01-01T00:00:00Z",
          settings: body.settings ?? {},
        })
      );
    },
    async listOrgUsers() {
      push({ method: "listOrgUsers" });
      await Promise.resolve();
      return state.responses.listOrgUsers ?? ok<readonly OrgUserResponse[], ApiError>([]);
    },
    async inviteUser(body) {
      push({ method: "inviteUser", body });
      await Promise.resolve();
      return (
        state.responses.inviteUser ??
        ok<OrgUserResponse, ApiError>({
          id: "00000000-0000-0000-0000-000000000001",
          email: body.email,
          display_name: body.email.split("@")[0] ?? "",
          role: body.role,
          is_owner: false,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async updateUserRole(userId, body) {
      push({ method: "updateUserRole", userId, body });
      await Promise.resolve();
      return (
        state.responses.updateUserRole ??
        ok<OrgUserResponse, ApiError>({
          id: userId,
          email: "user@example.com",
          display_name: "U",
          role: body.role,
          is_owner: false,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async removeUser(userId) {
      push({ method: "removeUser", userId });
      await Promise.resolve();
      return state.responses.removeUser ?? ok<null, ApiError>(null);
    },
    async transferOwnership(userId) {
      push({ method: "transferOwnership", userId });
      await Promise.resolve();
      return state.responses.transferOwnership ?? ok<null, ApiError>(null);
    },
    async listOrgRoles() {
      push({ method: "listOrgRoles" });
      await Promise.resolve();
      return state.responses.listOrgRoles ?? ok<readonly OrgRoleResponse[], ApiError>([]);
    },
    // ── Scans / Runs / Tags extras ─────────────────────────────
    async listRunScans(runId, filters) {
      push({ method: "listRunScans", runId, filters });
      await Promise.resolve();
      return (
        state.responses.listRunScans ??
        ok<PaginatedResponse<ScanBriefResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async listScanTags(scanId) {
      push({ method: "listScanTags", scanId });
      await Promise.resolve();
      return state.responses.listScanTags ?? ok<readonly ScanTagResponse[], ApiError>([]);
    },
    async getTagDefinition(slug) {
      push({ method: "getTagDefinition", slug });
      await Promise.resolve();
      return (
        state.responses.getTagDefinition ??
        ok<TagDefinitionWithDetailResponse, ApiError>({
          slug,
          category: "c",
          source: "system",
          display_name: slug,
          description: "",
          is_system: true,
          severity: "medium",
          scans_count: 0,
          rules_count: 0,
          organization_id: null,
          show_in_public_report: false,
        })
      );
    },
    async updateTagDefinition(slug, body) {
      push({ method: "updateTagDefinition", slug, body });
      await Promise.resolve();
      return (
        state.responses.updateTagDefinition ??
        ok<TagDefinitionWithDetailResponse, ApiError>({
          slug,
          category: "c",
          source: "custom",
          display_name: body.display_name ?? slug,
          description: body.description ?? "",
          is_system: false,
          severity: body.severity ?? "medium",
          scans_count: 0,
          rules_count: 0,
          organization_id: "00000000-0000-0000-0000-000000000010",
          show_in_public_report: body.show_in_public_report ?? false,
        })
      );
    },
    async deleteTagDefinition(slug) {
      push({ method: "deleteTagDefinition", slug });
      await Promise.resolve();
      return state.responses.deleteTagDefinition ?? ok<null, ApiError>(null);
    },
    // ── Custom rules extras ────────────────────────────────────
    async getCustomRule(id) {
      push({ method: "getCustomRule", id });
      await Promise.resolve();
      return (
        state.responses.getCustomRule ??
        ok<CustomRuleResponse, ApiError>({
          id,
          name: "R",
          tag_slug: "x",
          rule_type: "regex",
          config: {},
          target: "page",
          is_active: true,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async updateCustomRule(id, body) {
      push({ method: "updateCustomRule", id, body });
      await Promise.resolve();
      return (
        state.responses.updateCustomRule ??
        ok<CustomRuleResponse, ApiError>({
          id,
          name: body.name ?? "R",
          tag_slug: body.tag_slug ?? "x",
          rule_type: body.rule_type ?? "regex",
          config: body.config ?? {},
          target: body.target ?? "page",
          is_active: body.is_active ?? true,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async testCustomRule(body) {
      push({ method: "testCustomRule", body });
      await Promise.resolve();
      return state.responses.testCustomRule ?? ok<TestCustomRuleResponse, ApiError>({ matched: false, details: {} });
    },
    // ── Policy sets extras ─────────────────────────────────────
    async updatePolicySet(id, body) {
      push({ method: "updatePolicySet", id, body });
      await Promise.resolve();
      return (
        state.responses.updatePolicySet ??
        ok<PolicySetResponse, ApiError>({
          id,
          name: body.name ?? "x",
          description: body.description ?? "",
          visibility: "private",
          is_approved: false,
          created_at: "2026-05-16T00:00:00Z",
          entries: body.entries !== undefined ? [...body.entries] : [],
        })
      );
    },
    async deletePolicySet(id) {
      push({ method: "deletePolicySet", id });
      await Promise.resolve();
      return state.responses.deletePolicySet ?? ok<null, ApiError>(null);
    },
    async requestPolicySetApproval(id) {
      push({ method: "requestPolicySetApproval", id });
      await Promise.resolve();
      return (
        state.responses.requestPolicySetApproval ??
        ok<PolicySetResponse, ApiError>({
          id,
          name: "x",
          description: "",
          visibility: "public",
          is_approved: false,
          created_at: "2026-05-16T00:00:00Z",
          entries: [],
        })
      );
    },
    // ── Alerts extras ──────────────────────────────────────────
    async updateAlertStatus(alertId, body) {
      push({ method: "updateAlertStatus", alertId, body });
      await Promise.resolve();
      return state.responses.updateAlertStatus ?? ok<null, ApiError>(null);
    },
    async getAlertStats() {
      push({ method: "getAlertStats" });
      await Promise.resolve();
      return (
        state.responses.getAlertStats ??
        ok<AlertStatsResponse, ApiError>({ open: 0, ack: 0, resolved: 0, ignored: 0, total: 0 })
      );
    },
    // ── Campaign / group lifecycle ─────────────────────────────
    async runCampaign(id) {
      push({ method: "runCampaign", id });
      await Promise.resolve();
      return (
        state.responses.runCampaign ??
        ok<RunCommandResponse, ApiError>({ run_id: "00000000-0000-0000-0000-000000000888" })
      );
    },
    async cancelCampaign(id) {
      push({ method: "cancelCampaign", id });
      await Promise.resolve();
      return (
        state.responses.cancelCampaign ??
        ok<ArchiveOrCancelResponse, ApiError>({ id, affected_count: 0 })
      );
    },
    async unarchiveCampaign(id) {
      push({ method: "unarchiveCampaign", id });
      await Promise.resolve();
      return (
        state.responses.unarchiveCampaign ??
        ok<CampaignResponse, ApiError>({ ...DEFAULT_CAMPAIGN, id, is_archived: false })
      );
    },
    async listCampaignRuns(campaignId, filters) {
      push({ method: "listCampaignRuns", campaignId, filters });
      await Promise.resolve();
      return (
        state.responses.listCampaignRuns ??
        ok<PaginatedResponse<RunResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async runCampaignGroup(id) {
      push({ method: "runCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.runCampaignGroup ??
        ok<RunCommandResponse, ApiError>({ run_id: "00000000-0000-0000-0000-000000000999" })
      );
    },
    async cancelCampaignGroup(id) {
      push({ method: "cancelCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.cancelCampaignGroup ??
        ok<ArchiveOrCancelResponse, ApiError>({ id, affected_count: 0 })
      );
    },
    async archiveCampaignGroup(id) {
      push({ method: "archiveCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.archiveCampaignGroup ??
        ok<CampaignGroupResponse, ApiError>({ ...DEFAULT_GROUP, id, is_archived: true })
      );
    },
    async unarchiveCampaignGroup(id) {
      push({ method: "unarchiveCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.unarchiveCampaignGroup ??
        ok<CampaignGroupResponse, ApiError>({ ...DEFAULT_GROUP, id, is_archived: false })
      );
    },
    async pauseCampaignGroupSchedule(id) {
      push({ method: "pauseCampaignGroupSchedule", id });
      await Promise.resolve();
      return (
        state.responses.pauseCampaignGroupSchedule ??
        ok<CampaignGroupResponse, ApiError>({ ...DEFAULT_GROUP, id, schedule_paused: true })
      );
    },
    async resumeCampaignGroupSchedule(id) {
      push({ method: "resumeCampaignGroupSchedule", id });
      await Promise.resolve();
      return (
        state.responses.resumeCampaignGroupSchedule ??
        ok<CampaignGroupResponse, ApiError>({ ...DEFAULT_GROUP, id, schedule_paused: false })
      );
    },
    async cancelRun(id) {
      push({ method: "cancelRun", id });
      await Promise.resolve();
      return (
        state.responses.cancelRun ??
        ok<ArchiveOrCancelResponse, ApiError>({ id, affected_count: 0 })
      );
    },
    // ── Billing extras ─────────────────────────────────────────
    async listUsage(filters) {
      push({ method: "listUsage", filters });
      await Promise.resolve();
      return (
        state.responses.listUsage ??
        ok<PaginatedResponse<UsageResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async getUsageSummary() {
      push({ method: "getUsageSummary" });
      await Promise.resolve();
      return (
        state.responses.getUsageSummary ??
        ok<UsagePeriodSummaryResponse, ApiError>({
          total_micros: 0,
          checks_count: 0,
          period_start: null,
          period_end: null,
        })
      );
    },
    async listBalanceHistory(filters) {
      push({ method: "listBalanceHistory", filters });
      await Promise.resolve();
      return (
        state.responses.listBalanceHistory ??
        ok<PaginatedResponse<BalanceTransactionResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async listInvoices(filters) {
      push({ method: "listInvoices", filters });
      await Promise.resolve();
      return (
        state.responses.listInvoices ??
        ok<PaginatedResponse<InvoiceResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    // ── Webhooks extras ────────────────────────────────────────
    async getWebhook(id) {
      push({ method: "getWebhook", id });
      await Promise.resolve();
      return (
        state.responses.getWebhook ??
        ok<WebhookResponse, ApiError>({
          id,
          url: "https://x/wh",
          event_types: ["scan.done"],
          is_active: true,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async updateWebhook(id, body) {
      push({ method: "updateWebhook", id, body });
      await Promise.resolve();
      return (
        state.responses.updateWebhook ??
        ok<WebhookResponse, ApiError>({
          id,
          url: body.url ?? "https://x/wh",
          event_types: body.event_types !== undefined ? [...body.event_types] : ["scan.done"],
          is_active: body.is_active ?? true,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async listWebhookEventTypes() {
      push({ method: "listWebhookEventTypes" });
      await Promise.resolve();
      return state.responses.listWebhookEventTypes ?? ok<readonly WebhookEventCatalogEntry[], ApiError>([]);
    },
    async listWebhookDeliveries(endpointId, filters) {
      push({ method: "listWebhookDeliveries", endpointId, filters });
      await Promise.resolve();
      return (
        state.responses.listWebhookDeliveries ??
        ok<PaginatedResponse<WebhookDeliveryAttemptResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async testWebhook(endpointId) {
      push({ method: "testWebhook", endpointId });
      await Promise.resolve();
      return state.responses.testWebhook ?? ok<null, ApiError>(null);
    },
    async rotateWebhookSecret(endpointId) {
      push({ method: "rotateWebhookSecret", endpointId });
      await Promise.resolve();
      return (
        state.responses.rotateWebhookSecret ??
        ok<WebhookCreatedResponse, ApiError>({
          id: endpointId,
          url: "https://x/wh",
          event_types: ["scan.done"],
          is_active: true,
          created_at: "2026-05-16T00:00:00Z",
          signing_secret: "whsec_rotated",
        })
      );
    },
    async replayWebhookDelivery(attemptId) {
      push({ method: "replayWebhookDelivery", attemptId });
      await Promise.resolve();
      return state.responses.replayWebhookDelivery ?? ok<null, ApiError>(null);
    },
    async bulkReplayWebhook(endpointId, body) {
      push({ method: "bulkReplayWebhook", endpointId, body });
      await Promise.resolve();
      return (
        state.responses.bulkReplayWebhook ?? ok<{ replayed_count: number }, ApiError>({ replayed_count: 0 })
      );
    },
    // ── Alert notifications ────────────────────────────────────
    async listAlertDestinations() {
      push({ method: "listAlertDestinations" });
      await Promise.resolve();
      return (
        state.responses.listAlertDestinations ?? ok<readonly AlertNotificationDestination[], ApiError>([])
      );
    },
    async deleteAlertDestination(id) {
      push({ method: "deleteAlertDestination", id });
      await Promise.resolve();
      return state.responses.deleteAlertDestination ?? ok<null, ApiError>(null);
    },
    async setAlertDestinationVersion(id, body) {
      push({ method: "setAlertDestinationVersion", id, body });
      await Promise.resolve();
      return (
        state.responses.setAlertDestinationVersion ??
        ok<AlertNotificationDestination, ApiError>({
          id,
          kind: "slack",
          name: "default",
          version: body.version,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async getCampaignAlertOverrides(campaignId) {
      push({ method: "getCampaignAlertOverrides", campaignId });
      await Promise.resolve();
      return (
        state.responses.getCampaignAlertOverrides ??
        ok<CampaignAlertOverrides, ApiError>({
          campaign_id: campaignId,
          destination_ids: [],
          muted: false,
        })
      );
    },
    async setCampaignAlertOverrides(campaignId, body) {
      push({ method: "setCampaignAlertOverrides", campaignId, body });
      await Promise.resolve();
      return (
        state.responses.setCampaignAlertOverrides ??
        ok<CampaignAlertOverrides, ApiError>({
          campaign_id: campaignId,
          destination_ids: [...body.destination_ids],
          muted: body.muted,
        })
      );
    },
  };
}

export function makeApiError(kind: ApiError["kind"], detail: string): ApiError {
  switch (kind) {
    case "unauthorized":
    case "forbidden":
    case "not-found":
    case "rate-limited":
    case "invalid-input":
    case "upstream":
      return { kind, detail };
  }
}

export { err, ok };
