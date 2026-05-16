/**
 * Recording-spy fake for the `ApiGateway` port.
 *
 * Each method returns a pre-configured `Result` and pushes its call into
 * a `calls` array so tests can assert on what was invoked. ZERO business
 * logic — never reimplement the API's filtering / matching / validation
 * inside a fake.
 */

import type {
  AlertNotificationDestinationResponse,
  AlertResponse,
  AlertStatsResponse,
  ApiError,
  ApiGateway,
  ApiKeyCreatedResponse,
  ApiKeyResponse,
  BalanceTransactionResponse,
  BillingSummaryResponse,
  BulkReplayRequest,
  BulkReplayResponse,
  BulkScanRequest,
  CampaignGroupResponse,
  CampaignOverridesResponse,
  CampaignResponse,
  CancelPendingResponse,
  CreateApiKeyRequest,
  CreateCampaignGroupRequest,
  CreateCampaignRequest,
  CreateCustomRuleRequest,
  CreatePolicySetRequest,
  CreateScanRequest,
  CreateWebhookRequest,
  CustomRuleResponse,
  DeliveryAttemptResponse,
  EmulatorResponse,
  EventCatalogResponse,
  GeoResponse,
  GroupActionResponse,
  InviteUserRequest,
  InvoiceResponse,
  ListAlertsFilters,
  ListBalanceHistoryFilters,
  ListCampaignsFilters,
  ListScansFilters,
  ListUsageFilters,
  OrgResponse,
  PageFilters,
  PaginatedResponse,
  PolicySetResponse,
  RecheckRequest,
  RecheckResponse,
  RoleResponse,
  RuleTestRequest,
  RuleTestResponse,
  RunResponse,
  ScanBriefResponse,
  ScanResponse,
  ScanTagResponse,
  SetCampaignOverridesRequest,
  SetDestinationVersionRequest,
  TagDefinitionDetailResponse,
  TagDefinitionResponse,
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
  UserResponse,
  WebhookCreatedResponse,
  WebhookResponse,
} from "../../src/domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../src/shared/result.js";

type Call =
  | { readonly method: "getAccount" }
  | { readonly method: "updateOrg"; readonly body: UpdateOrgRequest }
  | { readonly method: "listOrgUsers" }
  | { readonly method: "inviteUser"; readonly body: InviteUserRequest }
  | {
      readonly method: "updateUserRole";
      readonly userId: string;
      readonly body: UpdateUserRoleRequest;
    }
  | { readonly method: "removeUser"; readonly userId: string }
  | { readonly method: "transferOwnership"; readonly userId: string }
  | { readonly method: "listOrgRoles" }
  | { readonly method: "listApiKeys" }
  | { readonly method: "createApiKey"; readonly body: CreateApiKeyRequest }
  | { readonly method: "revokeApiKey"; readonly id: string }
  | { readonly method: "listScans"; readonly filters: ListScansFilters }
  | { readonly method: "getScan"; readonly scanId: string }
  | { readonly method: "createScan"; readonly body: CreateScanRequest }
  | { readonly method: "createBulkScans"; readonly body: BulkScanRequest }
  | { readonly method: "recheckScans"; readonly body: RecheckRequest }
  | { readonly method: "cancelScan"; readonly scanId: string }
  | { readonly method: "listScanTags"; readonly scanId: string }
  | { readonly method: "listGeos" }
  | { readonly method: "listEmulators" }
  | { readonly method: "listCampaigns"; readonly filters: ListCampaignsFilters }
  | { readonly method: "getCampaign"; readonly id: string }
  | { readonly method: "createCampaign"; readonly body: CreateCampaignRequest }
  | {
      readonly method: "updateCampaign";
      readonly id: string;
      readonly body: UpdateCampaignRequest;
    }
  | { readonly method: "runCampaign"; readonly id: string }
  | { readonly method: "archiveCampaign"; readonly id: string }
  | { readonly method: "unarchiveCampaign"; readonly id: string }
  | { readonly method: "cancelCampaign"; readonly id: string }
  | {
      readonly method: "listCampaignRuns";
      readonly campaignId: string;
      readonly filters: PageFilters;
    }
  | { readonly method: "getRun"; readonly id: string }
  | { readonly method: "cancelRun"; readonly id: string }
  | {
      readonly method: "listRunScans";
      readonly runId: string;
      readonly filters: PageFilters;
    }
  | { readonly method: "listCampaignGroups"; readonly filters: PageFilters }
  | { readonly method: "getCampaignGroup"; readonly id: string }
  | { readonly method: "createCampaignGroup"; readonly body: CreateCampaignGroupRequest }
  | {
      readonly method: "updateCampaignGroup";
      readonly id: string;
      readonly body: UpdateCampaignGroupRequest;
    }
  | { readonly method: "runCampaignGroup"; readonly id: string }
  | { readonly method: "cancelCampaignGroup"; readonly id: string }
  | { readonly method: "archiveCampaignGroup"; readonly id: string }
  | { readonly method: "unarchiveCampaignGroup"; readonly id: string }
  | { readonly method: "pauseCampaignGroupSchedule"; readonly id: string }
  | { readonly method: "resumeCampaignGroupSchedule"; readonly id: string }
  | { readonly method: "listTags" }
  | { readonly method: "getTagDefinition"; readonly slug: string }
  | {
      readonly method: "updateTagDefinition";
      readonly slug: string;
      readonly body: UpdateTagDefinitionRequest;
    }
  | { readonly method: "deleteTagDefinition"; readonly slug: string }
  | { readonly method: "listCustomRules"; readonly filters: PageFilters }
  | { readonly method: "getCustomRule"; readonly id: string }
  | { readonly method: "createCustomRule"; readonly body: CreateCustomRuleRequest }
  | {
      readonly method: "updateCustomRule";
      readonly id: string;
      readonly body: UpdateCustomRuleRequest;
    }
  | { readonly method: "deleteCustomRule"; readonly id: string }
  | { readonly method: "testCustomRule"; readonly body: RuleTestRequest }
  | { readonly method: "listPolicySets" }
  | { readonly method: "getPolicySet"; readonly id: string }
  | { readonly method: "createPolicySet"; readonly body: CreatePolicySetRequest }
  | {
      readonly method: "updatePolicySet";
      readonly id: string;
      readonly body: UpdatePolicySetRequest;
    }
  | { readonly method: "deletePolicySet"; readonly id: string }
  | { readonly method: "requestPolicySetApproval"; readonly id: string }
  | { readonly method: "listAlerts"; readonly filters: ListAlertsFilters }
  | {
      readonly method: "updateAlertStatus";
      readonly alertId: string;
      readonly body: UpdateAlertStatusRequest;
    }
  | { readonly method: "getAlertStats" }
  | { readonly method: "listWebhooks" }
  | { readonly method: "getWebhook"; readonly id: string }
  | { readonly method: "createWebhook"; readonly body: CreateWebhookRequest }
  | {
      readonly method: "updateWebhook";
      readonly id: string;
      readonly body: UpdateWebhookRequest;
    }
  | { readonly method: "deleteWebhook"; readonly id: string }
  | { readonly method: "testWebhook"; readonly endpointId: string }
  | { readonly method: "rotateWebhookSecret"; readonly endpointId: string }
  | { readonly method: "listWebhookEventTypes" }
  | {
      readonly method: "listWebhookDeliveries";
      readonly endpointId: string;
      readonly filters: PageFilters;
    }
  | { readonly method: "replayWebhookDelivery"; readonly attemptId: string }
  | {
      readonly method: "bulkReplayWebhook";
      readonly endpointId: string;
      readonly body: BulkReplayRequest;
    }
  | { readonly method: "getBillingSummary" }
  | { readonly method: "listUsage"; readonly filters: ListUsageFilters }
  | { readonly method: "getUsageSummary" }
  | { readonly method: "listBalanceHistory"; readonly filters: ListBalanceHistoryFilters }
  | { readonly method: "listInvoices"; readonly filters: PageFilters }
  | { readonly method: "listAlertDestinations" }
  | { readonly method: "deleteAlertDestination"; readonly id: string }
  | {
      readonly method: "setAlertDestinationVersion";
      readonly id: string;
      readonly body: SetDestinationVersionRequest;
    }
  | { readonly method: "getCampaignAlertOverrides"; readonly campaignId: string }
  | {
      readonly method: "setCampaignAlertOverrides";
      readonly campaignId: string;
      readonly body: SetCampaignOverridesRequest;
    };

export interface FakeApiGatewayState {
  readonly calls: Call[];
  responses: {
    getAccount?: Result<OrgResponse, ApiError>;
    updateOrg?: Result<OrgResponse, ApiError>;
    listOrgUsers?: Result<readonly UserResponse[], ApiError>;
    inviteUser?: Result<UserResponse, ApiError>;
    updateUserRole?: Result<UserResponse, ApiError>;
    removeUser?: Result<null, ApiError>;
    transferOwnership?: Result<null, ApiError>;
    listOrgRoles?: Result<readonly RoleResponse[], ApiError>;
    listApiKeys?: Result<readonly ApiKeyResponse[], ApiError>;
    createApiKey?: Result<ApiKeyCreatedResponse, ApiError>;
    revokeApiKey?: Result<null, ApiError>;
    listScans?: Result<PaginatedResponse<ScanBriefResponse>, ApiError>;
    getScan?: Result<ScanResponse, ApiError>;
    createScan?: Result<ScanResponse, ApiError>;
    createBulkScans?: Result<readonly ScanResponse[], ApiError>;
    recheckScans?: Result<RecheckResponse, ApiError>;
    cancelScan?: Result<CancelPendingResponse, ApiError>;
    listScanTags?: Result<readonly ScanTagResponse[], ApiError>;
    listGeos?: Result<readonly GeoResponse[], ApiError>;
    listEmulators?: Result<readonly EmulatorResponse[], ApiError>;
    listCampaigns?: Result<PaginatedResponse<CampaignResponse>, ApiError>;
    getCampaign?: Result<CampaignResponse, ApiError>;
    createCampaign?: Result<CampaignResponse, ApiError>;
    updateCampaign?: Result<CampaignResponse, ApiError>;
    runCampaign?: Result<RunResponse, ApiError>;
    archiveCampaign?: Result<CampaignResponse, ApiError>;
    unarchiveCampaign?: Result<CampaignResponse, ApiError>;
    cancelCampaign?: Result<CancelPendingResponse, ApiError>;
    listCampaignRuns?: Result<PaginatedResponse<RunResponse>, ApiError>;
    getRun?: Result<RunResponse, ApiError>;
    cancelRun?: Result<CancelPendingResponse, ApiError>;
    listRunScans?: Result<PaginatedResponse<ScanBriefResponse>, ApiError>;
    listCampaignGroups?: Result<PaginatedResponse<CampaignGroupResponse>, ApiError>;
    getCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    createCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    updateCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    runCampaignGroup?: Result<GroupActionResponse, ApiError>;
    cancelCampaignGroup?: Result<GroupActionResponse, ApiError>;
    archiveCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    unarchiveCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    pauseCampaignGroupSchedule?: Result<CampaignGroupResponse, ApiError>;
    resumeCampaignGroupSchedule?: Result<CampaignGroupResponse, ApiError>;
    listTags?: Result<readonly TagDefinitionResponse[], ApiError>;
    getTagDefinition?: Result<TagDefinitionDetailResponse, ApiError>;
    updateTagDefinition?: Result<TagDefinitionDetailResponse, ApiError>;
    deleteTagDefinition?: Result<null, ApiError>;
    listCustomRules?: Result<readonly CustomRuleResponse[], ApiError>;
    getCustomRule?: Result<CustomRuleResponse, ApiError>;
    createCustomRule?: Result<CustomRuleResponse, ApiError>;
    updateCustomRule?: Result<CustomRuleResponse, ApiError>;
    deleteCustomRule?: Result<null, ApiError>;
    testCustomRule?: Result<RuleTestResponse, ApiError>;
    listPolicySets?: Result<readonly PolicySetResponse[], ApiError>;
    getPolicySet?: Result<PolicySetResponse, ApiError>;
    createPolicySet?: Result<PolicySetResponse, ApiError>;
    updatePolicySet?: Result<PolicySetResponse, ApiError>;
    deletePolicySet?: Result<null, ApiError>;
    requestPolicySetApproval?: Result<PolicySetResponse, ApiError>;
    listAlerts?: Result<PaginatedResponse<AlertResponse>, ApiError>;
    updateAlertStatus?: Result<null, ApiError>;
    getAlertStats?: Result<AlertStatsResponse, ApiError>;
    listWebhooks?: Result<readonly WebhookResponse[], ApiError>;
    getWebhook?: Result<WebhookResponse, ApiError>;
    createWebhook?: Result<WebhookCreatedResponse, ApiError>;
    updateWebhook?: Result<WebhookResponse, ApiError>;
    deleteWebhook?: Result<null, ApiError>;
    testWebhook?: Result<null, ApiError>;
    rotateWebhookSecret?: Result<WebhookCreatedResponse, ApiError>;
    listWebhookEventTypes?: Result<EventCatalogResponse, ApiError>;
    listWebhookDeliveries?: Result<PaginatedResponse<DeliveryAttemptResponse>, ApiError>;
    replayWebhookDelivery?: Result<null, ApiError>;
    bulkReplayWebhook?: Result<BulkReplayResponse, ApiError>;
    getBillingSummary?: Result<BillingSummaryResponse, ApiError>;
    listUsage?: Result<PaginatedResponse<UsageResponse>, ApiError>;
    getUsageSummary?: Result<UsagePeriodSummaryResponse, ApiError>;
    listBalanceHistory?: Result<PaginatedResponse<BalanceTransactionResponse>, ApiError>;
    listInvoices?: Result<PaginatedResponse<InvoiceResponse>, ApiError>;
    listAlertDestinations?: Result<readonly AlertNotificationDestinationResponse[], ApiError>;
    deleteAlertDestination?: Result<null, ApiError>;
    setAlertDestinationVersion?: Result<AlertNotificationDestinationResponse, ApiError>;
    getCampaignAlertOverrides?: Result<CampaignOverridesResponse, ApiError>;
    setCampaignAlertOverrides?: Result<CampaignOverridesResponse, ApiError>;
  };
}

const DEFAULT_ORG: OrgResponse = {
  id: "00000000-0000-0000-0000-000000000010",
  name: "Test Org",
  owner_id: "00000000-0000-0000-0000-000000000001",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
};

const DEFAULT_SCAN: ScanResponse = {
  id: "00000000-0000-0000-0000-000000000aaa",
  url: "https://ad.example/a",
  country_code: "US",
  emulator_id: "default",
  status: "completed",
  offer_url: "https://offer.example",
  screenshot_url: "",
  ad_tag: null,
  creative_screenshot_url: "",
  page_title: "",
  elapsed_ms: 1000,
  error: "",
  labels: {},
  campaign_id: null,
  campaign_name: null,
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
  group_id: "00000000-0000-0000-0000-000000000111",
  labels: {},
  policy_set_id: null,
  schedule_enabled: false,
  schedule_type: "manual",
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
  campaign_count: 0,
  created_at: "2026-05-16T00:00:00Z",
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
  source: "api",
  created_at: "2026-05-16T00:00:00Z",
};

const DEFAULT_GROUP_ACTION: GroupActionResponse = {
  group_id: DEFAULT_GROUP.id,
  affected_campaigns: 1,
  cancelled_count: 0,
  run_ids: [],
  failures: [],
};

const DEFAULT_WEBHOOK: WebhookResponse = {
  id: "00000000-0000-0000-0000-000000000eee",
  url: "https://x/wh",
  description: "",
  event_types: ["scan.done"],
  campaign_ids: [],
  is_active: true,
  disabled_reason: null,
  disabled_at: null,
  health: {
    consecutive_failures: 0,
    last_delivery_at: null,
    last_delivery_status: null,
    success_rate_7d: 1,
  },
  created_at: "2026-05-16T00:00:00Z",
  updated_at: "2026-05-16T00:00:00Z",
};

export function createFakeApiGateway(): ApiGateway & { readonly state: FakeApiGatewayState } {
  const state: FakeApiGatewayState = { calls: [], responses: {} };
  function push(call: Call): void {
    state.calls.push(call);
  }

  return {
    state,
    // ── Account ────────────────────────────────────────────────
    async getAccount() {
      push({ method: "getAccount" });
      await Promise.resolve();
      return state.responses.getAccount ?? ok<OrgResponse, ApiError>(DEFAULT_ORG);
    },
    async updateOrg(body) {
      push({ method: "updateOrg", body });
      await Promise.resolve();
      return (
        state.responses.updateOrg ??
        ok<OrgResponse, ApiError>({ ...DEFAULT_ORG, name: body.name ?? DEFAULT_ORG.name })
      );
    },
    async listOrgUsers() {
      push({ method: "listOrgUsers" });
      await Promise.resolve();
      return state.responses.listOrgUsers ?? ok<readonly UserResponse[], ApiError>([]);
    },
    async inviteUser(body) {
      push({ method: "inviteUser", body });
      await Promise.resolve();
      return (
        state.responses.inviteUser ??
        ok<UserResponse, ApiError>({
          id: "00000000-0000-0000-0000-000000000002",
          email: body.email,
          name: body.name ?? body.email.split("@")[0] ?? "",
          role_name: "member",
          is_active: true,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async updateUserRole(userId, body) {
      push({ method: "updateUserRole", userId, body });
      await Promise.resolve();
      return (
        state.responses.updateUserRole ??
        ok<UserResponse, ApiError>({
          id: userId,
          email: "user@example.com",
          name: "U",
          role_name: body.role_id,
          is_active: true,
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
      return state.responses.listOrgRoles ?? ok<readonly RoleResponse[], ApiError>([]);
    },
    async listApiKeys() {
      push({ method: "listApiKeys" });
      await Promise.resolve();
      return state.responses.listApiKeys ?? ok<readonly ApiKeyResponse[], ApiError>([]);
    },
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

    // ── Scans ──────────────────────────────────────────────────
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
    async listScanTags(scanId) {
      push({ method: "listScanTags", scanId });
      await Promise.resolve();
      return state.responses.listScanTags ?? ok<readonly ScanTagResponse[], ApiError>([]);
    },

    // ── Geos / emulators ───────────────────────────────────────
    async listGeos() {
      push({ method: "listGeos" });
      await Promise.resolve();
      return state.responses.listGeos ?? ok<readonly GeoResponse[], ApiError>([]);
    },
    async listEmulators() {
      push({ method: "listEmulators" });
      await Promise.resolve();
      return state.responses.listEmulators ?? ok<readonly EmulatorResponse[], ApiError>([]);
    },

    // ── Campaigns ──────────────────────────────────────────────
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
    async runCampaign(id) {
      push({ method: "runCampaign", id });
      await Promise.resolve();
      return state.responses.runCampaign ?? ok<RunResponse, ApiError>(DEFAULT_RUN);
    },
    async archiveCampaign(id) {
      push({ method: "archiveCampaign", id });
      await Promise.resolve();
      return (
        state.responses.archiveCampaign ??
        ok<CampaignResponse, ApiError>({ ...DEFAULT_CAMPAIGN, is_archived: true })
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
    async cancelCampaign(id) {
      push({ method: "cancelCampaign", id });
      await Promise.resolve();
      return (
        state.responses.cancelCampaign ??
        ok<CancelPendingResponse, ApiError>({ cancelled_count: 0 })
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

    // ── Runs ───────────────────────────────────────────────────
    async getRun(id) {
      push({ method: "getRun", id });
      await Promise.resolve();
      return state.responses.getRun ?? ok<RunResponse, ApiError>(DEFAULT_RUN);
    },
    async cancelRun(id) {
      push({ method: "cancelRun", id });
      await Promise.resolve();
      return (
        state.responses.cancelRun ?? ok<CancelPendingResponse, ApiError>({ cancelled_count: 0 })
      );
    },
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

    // ── Campaign groups ────────────────────────────────────────
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
      return (
        state.responses.createCampaignGroup ??
        ok<CampaignGroupResponse, ApiError>({ ...DEFAULT_GROUP, name: body.name })
      );
    },
    async updateCampaignGroup(id, body) {
      push({ method: "updateCampaignGroup", id, body });
      await Promise.resolve();
      return (
        state.responses.updateCampaignGroup ??
        ok<CampaignGroupResponse, ApiError>({ ...DEFAULT_GROUP, id })
      );
    },
    async runCampaignGroup(id) {
      push({ method: "runCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.runCampaignGroup ??
        ok<GroupActionResponse, ApiError>({ ...DEFAULT_GROUP_ACTION, group_id: id })
      );
    },
    async cancelCampaignGroup(id) {
      push({ method: "cancelCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.cancelCampaignGroup ??
        ok<GroupActionResponse, ApiError>({ ...DEFAULT_GROUP_ACTION, group_id: id })
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

    // ── Tag definitions ────────────────────────────────────────
    async listTags() {
      push({ method: "listTags" });
      await Promise.resolve();
      return state.responses.listTags ?? ok<readonly TagDefinitionResponse[], ApiError>([]);
    },
    async getTagDefinition(slug) {
      push({ method: "getTagDefinition", slug });
      await Promise.resolve();
      return (
        state.responses.getTagDefinition ??
        ok<TagDefinitionDetailResponse, ApiError>({
          slug,
          category: "c",
          source: "system",
          display_name: slug,
          description: "",
          severity: "medium",
          is_system: true,
          organization_id: null,
          show_in_public_report: false,
          scans_count: 0,
          rules_count: 0,
        })
      );
    },
    async updateTagDefinition(slug, body) {
      push({ method: "updateTagDefinition", slug, body });
      await Promise.resolve();
      return (
        state.responses.updateTagDefinition ??
        ok<TagDefinitionDetailResponse, ApiError>({
          slug,
          category: "c",
          source: "custom",
          display_name: body.display_name ?? slug,
          description: body.description ?? "",
          severity: body.severity ?? "medium",
          is_system: false,
          organization_id: "00000000-0000-0000-0000-000000000010",
          show_in_public_report: body.show_in_public_report ?? false,
          scans_count: 0,
          rules_count: 0,
        })
      );
    },
    async deleteTagDefinition(slug) {
      push({ method: "deleteTagDefinition", slug });
      await Promise.resolve();
      return state.responses.deleteTagDefinition ?? ok<null, ApiError>(null);
    },

    // ── Custom rules ───────────────────────────────────────────
    async listCustomRules(filters) {
      push({ method: "listCustomRules", filters });
      await Promise.resolve();
      return state.responses.listCustomRules ?? ok<readonly CustomRuleResponse[], ApiError>([]);
    },
    async getCustomRule(id) {
      push({ method: "getCustomRule", id });
      await Promise.resolve();
      return (
        state.responses.getCustomRule ??
        ok<CustomRuleResponse, ApiError>({
          id,
          organization_id: "00000000-0000-0000-0000-000000000010",
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
    async createCustomRule(body) {
      push({ method: "createCustomRule", body });
      await Promise.resolve();
      return (
        state.responses.createCustomRule ??
        ok<CustomRuleResponse, ApiError>({
          id: "00000000-0000-0000-0000-000000000bbb",
          organization_id: "00000000-0000-0000-0000-000000000010",
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
    async updateCustomRule(id, body) {
      push({ method: "updateCustomRule", id, body });
      await Promise.resolve();
      return (
        state.responses.updateCustomRule ??
        ok<CustomRuleResponse, ApiError>({
          id,
          organization_id: "00000000-0000-0000-0000-000000000010",
          name: body.name ?? "R",
          tag_slug: body.tag_slug ?? "x",
          rule_type: "regex",
          config: body.config ?? {},
          target: body.target ?? "page",
          is_active: body.is_active ?? true,
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async deleteCustomRule(id) {
      push({ method: "deleteCustomRule", id });
      await Promise.resolve();
      return state.responses.deleteCustomRule ?? ok<null, ApiError>(null);
    },
    async testCustomRule(body) {
      push({ method: "testCustomRule", body });
      await Promise.resolve();
      return (
        state.responses.testCustomRule ??
        ok<RuleTestResponse, ApiError>({ matched: false, elapsed_ms: 1, tags: [] })
      );
    },

    // ── Policy sets ────────────────────────────────────────────
    async listPolicySets() {
      push({ method: "listPolicySets" });
      await Promise.resolve();
      return state.responses.listPolicySets ?? ok<readonly PolicySetResponse[], ApiError>([]);
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
          organization_id: "00000000-0000-0000-0000-000000000010",
          visibility: "private",
          is_approved: true,
          entries: [],
          created_at: "2026-05-16T00:00:00Z",
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
          organization_id: "00000000-0000-0000-0000-000000000010",
          visibility: "private",
          is_approved: false,
          entries: body.entries.map((e, i) => ({
            id: `entry-${i}`,
            tag_slug: e.tag_slug,
            country_codes: [...(e.country_codes ?? [])],
          })),
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async updatePolicySet(id, body) {
      push({ method: "updatePolicySet", id, body });
      await Promise.resolve();
      return (
        state.responses.updatePolicySet ??
        ok<PolicySetResponse, ApiError>({
          id,
          name: body.name,
          description: body.description ?? "",
          organization_id: "00000000-0000-0000-0000-000000000010",
          visibility: "private",
          is_approved: false,
          entries: body.entries.map((e, i) => ({
            id: `entry-${i}`,
            tag_slug: e.tag_slug,
            country_codes: [...(e.country_codes ?? [])],
          })),
          created_at: "2026-05-16T00:00:00Z",
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
          organization_id: "00000000-0000-0000-0000-000000000010",
          visibility: "public",
          is_approved: false,
          entries: [],
          created_at: "2026-05-16T00:00:00Z",
        })
      );
    },

    // ── Alerts ─────────────────────────────────────────────────
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
        ok<AlertStatsResponse, ApiError>({
          open: 0,
          acknowledged: 0,
          resolved: 0,
          dismissed: 0,
        })
      );
    },

    // ── Webhooks ───────────────────────────────────────────────
    async listWebhooks() {
      push({ method: "listWebhooks" });
      await Promise.resolve();
      return state.responses.listWebhooks ?? ok<readonly WebhookResponse[], ApiError>([]);
    },
    async getWebhook(id) {
      push({ method: "getWebhook", id });
      await Promise.resolve();
      return (
        state.responses.getWebhook ?? ok<WebhookResponse, ApiError>({ ...DEFAULT_WEBHOOK, id })
      );
    },
    async createWebhook(body) {
      push({ method: "createWebhook", body });
      await Promise.resolve();
      return (
        state.responses.createWebhook ??
        ok<WebhookCreatedResponse, ApiError>({
          webhook: {
            ...DEFAULT_WEBHOOK,
            url: body.url,
            description: body.description ?? "",
            event_types: [...(body.event_types ?? [])],
            campaign_ids: [...(body.campaign_ids ?? [])],
          },
          secret: "whsec_abc",
        })
      );
    },
    async updateWebhook(id, body) {
      push({ method: "updateWebhook", id, body });
      await Promise.resolve();
      return (
        state.responses.updateWebhook ??
        ok<WebhookResponse, ApiError>({
          ...DEFAULT_WEBHOOK,
          id,
          url: body.url ?? DEFAULT_WEBHOOK.url,
          description: body.description ?? DEFAULT_WEBHOOK.description,
          event_types:
            body.event_types === undefined || body.event_types === null
              ? DEFAULT_WEBHOOK.event_types
              : [...body.event_types],
          campaign_ids:
            body.campaign_ids === undefined || body.campaign_ids === null
              ? DEFAULT_WEBHOOK.campaign_ids
              : [...body.campaign_ids],
          is_active: body.is_active ?? DEFAULT_WEBHOOK.is_active,
        })
      );
    },
    async deleteWebhook(id) {
      push({ method: "deleteWebhook", id });
      await Promise.resolve();
      return state.responses.deleteWebhook ?? ok<null, ApiError>(null);
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
          webhook: { ...DEFAULT_WEBHOOK, id: endpointId },
          secret: "whsec_rotated",
        })
      );
    },
    async listWebhookEventTypes() {
      push({ method: "listWebhookEventTypes" });
      await Promise.resolve();
      return (
        state.responses.listWebhookEventTypes ?? ok<EventCatalogResponse, ApiError>({ entries: [] })
      );
    },
    async listWebhookDeliveries(endpointId, filters) {
      push({ method: "listWebhookDeliveries", endpointId, filters });
      await Promise.resolve();
      return (
        state.responses.listWebhookDeliveries ??
        ok<PaginatedResponse<DeliveryAttemptResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
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
        state.responses.bulkReplayWebhook ??
        ok<BulkReplayResponse, ApiError>({ replayed: 0, skipped: 0 })
      );
    },

    // ── Billing / invoicing ────────────────────────────────────
    async getBillingSummary() {
      push({ method: "getBillingSummary" });
      await Promise.resolve();
      return (
        state.responses.getBillingSummary ??
        ok<BillingSummaryResponse, ApiError>({
          balance_micros: 0,
          plan_id: null,
          plan_name: null,
          checks_per_period: null,
          checks_used: null,
          period_start: null,
          period_end: null,
          price_per_extra_check_micros: 0,
          is_suspended: false,
          can_create_scan: true,
          block_reason: null,
          billing_mode: "prepaid",
        })
      );
    },
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
          period_start: "2026-05-01T00:00:00Z",
          period_end: "2026-06-01T00:00:00Z",
          checks: 0,
          rechecks: 0,
          within_plan: 0,
          overage: 0,
          charged_micros: 0,
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

    // ── Alert notifications ────────────────────────────────────
    async listAlertDestinations() {
      push({ method: "listAlertDestinations" });
      await Promise.resolve();
      return (
        state.responses.listAlertDestinations ??
        ok<readonly AlertNotificationDestinationResponse[], ApiError>([])
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
        ok<AlertNotificationDestinationResponse, ApiError>({
          id,
          channel: "slack",
          name: "default",
          is_active: true,
          is_default_target: false,
          version: body.version,
          consecutive_failures: 0,
          last_delivery_at: null,
          last_delivery_status: null,
          slack_workspace_id: null,
          slack_channel_name: null,
          telegram_chat_title: null,
          telegram_chat_type: null,
          email_address: null,
          included_label_keys: [],
          created_at: "2026-05-16T00:00:00Z",
          updated_at: "2026-05-16T00:00:00Z",
        })
      );
    },
    async getCampaignAlertOverrides(campaignId) {
      push({ method: "getCampaignAlertOverrides", campaignId });
      await Promise.resolve();
      return (
        state.responses.getCampaignAlertOverrides ??
        ok<CampaignOverridesResponse, ApiError>({
          campaign_id: campaignId,
          mode: "inherit",
          destination_ids: [],
        })
      );
    },
    async setCampaignAlertOverrides(campaignId, body) {
      push({ method: "setCampaignAlertOverrides", campaignId, body });
      await Promise.resolve();
      return (
        state.responses.setCampaignAlertOverrides ??
        ok<CampaignOverridesResponse, ApiError>({
          campaign_id: campaignId,
          mode: body.mode,
          destination_ids: [...(body.destination_ids ?? [])],
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
