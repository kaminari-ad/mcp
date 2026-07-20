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
  BinaryDownload,
  BulkReplayRequest,
  BulkReplayResponse,
  BulkScanRequest,
  CampaignGroupResponse,
  CampaignOverridesResponse,
  CampaignPickerItem,
  CampaignResponse,
  CancelPendingResponse,
  CreateApiKeyRequest,
  CreateCampaignGroupRequest,
  CreateCampaignRequest,
  CreateCustomRoleRequest,
  CreateCustomRuleRequest,
  CreateCustomTaxonomyRequest,
  CreatePolicySetRequest,
  CreateScanRequest,
  CreateWebhookRequest,
  CustomRuleResponse,
  CustomTaxonomyListItem,
  CustomTaxonomyResponse,
  DeliveryAttemptResponse,
  EmulatorResponse,
  EventCatalogResponse,
  GeoResponse,
  GroupActionResponse,
  InviteUserRequest,
  InvoiceResponse,
  LabelDefinitionResponse,
  ListAlertsFilters,
  ListBalanceHistoryFilters,
  ListCampaignsFilters,
  ListCampaignsPickerFilters,
  ListInvoicesFilters,
  ListPolicySetsFilters,
  ListScansFilters,
  ListTagsFilters,
  ListUsageFilters,
  ListWebhookDeliveriesFilters,
  OrgResponse,
  PageFilters,
  PaginatedResponse,
  ParseTaxonomyTextRequest,
  ParseTaxonomyTextResponse,
  PolicySetListItemResponse,
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
  ScanTileResponse,
  SetCampaignOverridesRequest,
  SetDestinationVersionRequest,
  TagDefinitionDetailResponse,
  TagDefinitionResponse,
  TestWebhookRequest,
  TestWebhookResponse,
  UpdateAlertStatusRequest,
  UpdateCampaignGroupRequest,
  UpdateCampaignRequest,
  UpdateCustomRuleRequest,
  UpdateCustomTaxonomyRequest,
  UpdateLabelDefinitionsRequest,
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
  | { readonly method: "createCustomRole"; readonly body: CreateCustomRoleRequest }
  | { readonly method: "listAccountLabels" }
  | { readonly method: "updateAccountLabels"; readonly body: UpdateLabelDefinitionsRequest }
  | {
      readonly method: "getScanScreenshot";
      readonly scanId: string;
      readonly w: number | undefined;
    }
  | {
      readonly method: "getScanCreativeScreenshot";
      readonly scanId: string;
      readonly w: number | undefined;
    }
  | {
      readonly method: "getScanLandingScreenshot";
      readonly scanId: string;
      readonly landingOrd: number;
      readonly w: number | undefined;
    }
  | { readonly method: "getInvoicePdf"; readonly invoiceId: string }
  | { readonly method: "listApiKeys" }
  | { readonly method: "createApiKey"; readonly body: CreateApiKeyRequest }
  | { readonly method: "revokeApiKey"; readonly id: string }
  | { readonly method: "listScans"; readonly filters: ListScansFilters }
  | { readonly method: "getScan"; readonly scanId: string }
  | {
      readonly method: "listScanChildren";
      readonly scanId: string;
      readonly filters: PageFilters;
    }
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
  | {
      readonly method: "listCampaignsPicker";
      readonly filters: ListCampaignsPickerFilters | undefined;
    }
  | { readonly method: "getRun"; readonly id: string }
  | { readonly method: "cancelRun"; readonly id: string }
  | {
      readonly method: "listRunScans";
      readonly runId: string;
      readonly filters: PageFilters;
    }
  | { readonly method: "listCampaignGroups"; readonly filters: { readonly archived?: boolean } }
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
  | { readonly method: "listTags"; readonly filters: ListTagsFilters | undefined }
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
  | { readonly method: "listPolicySets"; readonly filters: ListPolicySetsFilters }
  | { readonly method: "getPolicySet"; readonly id: string }
  | { readonly method: "createPolicySet"; readonly body: CreatePolicySetRequest }
  | {
      readonly method: "updatePolicySet";
      readonly id: string;
      readonly body: UpdatePolicySetRequest;
    }
  | { readonly method: "deletePolicySet"; readonly id: string }
  | { readonly method: "requestPolicySetApproval"; readonly id: string }
  | { readonly method: "listCustomTaxonomies" }
  | { readonly method: "getCustomTaxonomy"; readonly id: string }
  | { readonly method: "createCustomTaxonomy"; readonly body: CreateCustomTaxonomyRequest }
  | {
      readonly method: "updateCustomTaxonomy";
      readonly id: string;
      readonly body: UpdateCustomTaxonomyRequest;
    }
  | { readonly method: "deleteCustomTaxonomy"; readonly id: string }
  | { readonly method: "restoreCustomTaxonomy"; readonly id: string }
  | { readonly method: "parseCustomTaxonomyText"; readonly body: ParseTaxonomyTextRequest }
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
  | {
      readonly method: "testWebhook";
      readonly endpointId: string;
      readonly body: TestWebhookRequest;
    }
  | { readonly method: "rotateWebhookSecret"; readonly endpointId: string }
  | { readonly method: "listWebhookEventTypes" }
  | {
      readonly method: "listWebhookDeliveries";
      readonly endpointId: string;
      readonly filters: ListWebhookDeliveriesFilters;
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
  | { readonly method: "listInvoices"; readonly filters: ListInvoicesFilters }
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
    updateUserRole?: Result<null, ApiError>;
    removeUser?: Result<null, ApiError>;
    transferOwnership?: Result<null, ApiError>;
    listOrgRoles?: Result<readonly RoleResponse[], ApiError>;
    createCustomRole?: Result<RoleResponse, ApiError>;
    listAccountLabels?: Result<readonly LabelDefinitionResponse[], ApiError>;
    updateAccountLabels?: Result<readonly LabelDefinitionResponse[], ApiError>;
    getScanScreenshot?: Result<BinaryDownload, ApiError>;
    getScanCreativeScreenshot?: Result<BinaryDownload, ApiError>;
    getScanLandingScreenshot?: Result<BinaryDownload, ApiError>;
    getInvoicePdf?: Result<BinaryDownload, ApiError>;
    listApiKeys?: Result<readonly ApiKeyResponse[], ApiError>;
    createApiKey?: Result<ApiKeyCreatedResponse, ApiError>;
    revokeApiKey?: Result<null, ApiError>;
    listScans?: Result<PaginatedResponse<ScanBriefResponse>, ApiError>;
    getScan?: Result<ScanResponse, ApiError>;
    listScanChildren?: Result<PaginatedResponse<ScanBriefResponse>, ApiError>;
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
    listCampaignsPicker?: Result<readonly CampaignPickerItem[], ApiError>;
    getRun?: Result<RunResponse, ApiError>;
    cancelRun?: Result<CancelPendingResponse, ApiError>;
    listRunScans?: Result<PaginatedResponse<ScanTileResponse>, ApiError>;
    listCampaignGroups?: Result<readonly CampaignGroupResponse[], ApiError>;
    getCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    createCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    updateCampaignGroup?: Result<CampaignGroupResponse, ApiError>;
    runCampaignGroup?: Result<GroupActionResponse, ApiError>;
    cancelCampaignGroup?: Result<GroupActionResponse, ApiError>;
    archiveCampaignGroup?: Result<GroupActionResponse, ApiError>;
    unarchiveCampaignGroup?: Result<GroupActionResponse, ApiError>;
    pauseCampaignGroupSchedule?: Result<CampaignGroupResponse, ApiError>;
    resumeCampaignGroupSchedule?: Result<CampaignGroupResponse, ApiError>;
    listTags?: Result<readonly TagDefinitionResponse[], ApiError>;
    getTagDefinition?: Result<TagDefinitionDetailResponse, ApiError>;
    updateTagDefinition?: Result<null, ApiError>;
    deleteTagDefinition?: Result<null, ApiError>;
    listCustomRules?: Result<PaginatedResponse<CustomRuleResponse>, ApiError>;
    getCustomRule?: Result<CustomRuleResponse, ApiError>;
    createCustomRule?: Result<CustomRuleResponse, ApiError>;
    updateCustomRule?: Result<CustomRuleResponse, ApiError>;
    deleteCustomRule?: Result<null, ApiError>;
    testCustomRule?: Result<RuleTestResponse, ApiError>;
    listPolicySets?: Result<PaginatedResponse<PolicySetListItemResponse>, ApiError>;
    getPolicySet?: Result<PolicySetResponse, ApiError>;
    createPolicySet?: Result<PolicySetResponse, ApiError>;
    updatePolicySet?: Result<PolicySetResponse, ApiError>;
    deletePolicySet?: Result<null, ApiError>;
    requestPolicySetApproval?: Result<null, ApiError>;
    listCustomTaxonomies?: Result<readonly CustomTaxonomyListItem[], ApiError>;
    getCustomTaxonomy?: Result<CustomTaxonomyResponse, ApiError>;
    createCustomTaxonomy?: Result<CustomTaxonomyResponse, ApiError>;
    updateCustomTaxonomy?: Result<CustomTaxonomyResponse, ApiError>;
    deleteCustomTaxonomy?: Result<null, ApiError>;
    restoreCustomTaxonomy?: Result<CustomTaxonomyResponse, ApiError>;
    parseCustomTaxonomyText?: Result<ParseTaxonomyTextResponse, ApiError>;
    listAlerts?: Result<PaginatedResponse<AlertResponse>, ApiError>;
    updateAlertStatus?: Result<null, ApiError>;
    getAlertStats?: Result<AlertStatsResponse, ApiError>;
    listWebhooks?: Result<readonly WebhookResponse[], ApiError>;
    getWebhook?: Result<WebhookResponse, ApiError>;
    createWebhook?: Result<WebhookCreatedResponse, ApiError>;
    updateWebhook?: Result<WebhookResponse, ApiError>;
    deleteWebhook?: Result<null, ApiError>;
    testWebhook?: Result<TestWebhookResponse, ApiError>;
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
    setAlertDestinationVersion?: Result<null, ApiError>;
    getCampaignAlertOverrides?: Result<CampaignOverridesResponse, ApiError>;
    setCampaignAlertOverrides?: Result<null, ApiError>;
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
  report_url: "https://app.kaminari.ad/scans/00000000-0000-0000-0000-000000000aaa",
  public_report_url: "https://app.kaminari.ad/public/scans/00000000-0000-0000-0000-000000000aaa",
  ad_tag: null,
  vast_tag: null,
  creative_kind: "banner",
  video: null,
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
  vast_tag: null,
  country_codes: ["US"],
  group_id: "00000000-0000-0000-0000-000000000111",
  emulator_selection: { categories: ["android_phone"], specific_ids: [], mode: "random" },
  proxy_type: "residential",
  proxy_region: "",
  proxy_city: "",
  proxy_isp: "",
  labels: {},
  policy_set_id: null,
  schedule_enabled: false,
  schedule_type: null,
  schedule_weekly: null,
  schedule_interval_seconds: null,
  schedule_timezone: null,
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

// `GET /runs/{run_id}/scans` returns a SLIM `ScanTileResponse` per item.
// Distinct from `DEFAULT_SCAN` (full `ScanResponse`) — see the port
// `ScanTileResponse` type in `domain/ports/api-gateway.ts`.
const DEFAULT_SCAN_TILE: ScanTileResponse = {
  id: "00000000-0000-0000-0000-000000000bbb",
  country_code: "US",
  status: "completed",
  offer_url: "https://offer.example",
  screenshot_url: "",
  report_url: "https://app.kaminari.ad/scans/00000000-0000-0000-0000-000000000bbb",
  public_report_url: "https://app.kaminari.ad/public/scans/00000000-0000-0000-0000-000000000bbb",
  elapsed_ms: 1234,
  error: "",
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

const DEFAULT_CAMPAIGN_PICKER_ITEM: CampaignPickerItem = {
  id: "00000000-0000-0000-0000-000000000ccc",
  name: "Test Campaign",
  group_id: "00000000-0000-0000-0000-000000000111",
  is_archived: false,
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

const DEFAULT_WEBHOOK_CREATED: WebhookCreatedResponse = {
  webhook: DEFAULT_WEBHOOK,
  secret: "whsec_abc",
};

const DEFAULT_WEBHOOK_ROTATED: WebhookCreatedResponse = {
  webhook: DEFAULT_WEBHOOK,
  secret: "whsec_rotated",
};

const DEFAULT_USER: UserResponse = {
  id: "00000000-0000-0000-0000-000000000002",
  email: "member@example.com",
  name: "Member",
  role_id: "00000000-0000-0000-0000-0000000003a1",
  role_name: "member",
  is_active: true,
  created_at: "2026-05-16T00:00:00Z",
};

const DEFAULT_API_KEY_CREATED: ApiKeyCreatedResponse = {
  id: "00000000-0000-0000-0000-000000000fff",
  key_prefix: "kad_new1",
  full_key: "kad_full_secret_test_value",
  name: "ci",
  expires_at: null,
  created_at: "2026-05-16T00:00:00Z",
};

const DEFAULT_CAMPAIGN_ARCHIVED: CampaignResponse = { ...DEFAULT_CAMPAIGN, is_archived: true };

const DEFAULT_GROUP_PAUSED: CampaignGroupResponse = { ...DEFAULT_GROUP, schedule_paused: true };

const DEFAULT_ROLE: RoleResponse = {
  id: "00000000-0000-0000-0000-000000000007",
  name: "viewer",
  scope: "organization",
  is_system: true,
  permissions: ["scans.read"],
};

const DEFAULT_CUSTOM_TAXONOMY: CustomTaxonomyResponse = {
  id: "00000000-0000-0000-0000-000000000aa1",
  organization_id: "00000000-0000-0000-0000-000000000010",
  name: "default",
  slug: "default",
  description: "",
  is_active: true,
  version: 1,
  nodes: [],
  created_at: "2026-05-20T00:00:00Z",
  updated_at: "2026-05-20T00:00:00Z",
};

const DEFAULT_TAG_DETAIL: TagDefinitionDetailResponse = {
  slug: "default-tag",
  category: "c",
  source: "system",
  display_name: "Default tag",
  description: "",
  severity: "medium",
  scope: "system",
  organization_id: null,
  visibility: "internal",
  scans_count: 0,
  rules_count: 0,
  linked_rules: [],
};

/**
 * Custom-tag variant of {@link DEFAULT_TAG_DETAIL} — same shape but
 * scoped to an org. Currently only used by tests that construct
 * arbitrary custom-tag fixtures (e.g. via `state.responses.X = ok(...)`).
 * Kept exported-shape via `export` so it doesn't trip tsc's unused-
 * locals check.
 */
export const DEFAULT_TAG_DETAIL_CUSTOM: TagDefinitionDetailResponse = {
  ...DEFAULT_TAG_DETAIL,
  source: "custom",
  scope: "personal",
  organization_id: "00000000-0000-0000-0000-000000000010",
};

const DEFAULT_CUSTOM_RULE: CustomRuleResponse = {
  id: "00000000-0000-0000-0000-000000000bbb",
  organization_id: "00000000-0000-0000-0000-000000000010",
  name: "R",
  tag_slug: "x",
  rule_type: "regex",
  config: {},
  target: "page",
  is_active: true,
  created_at: "2026-05-16T00:00:00Z",
};

const DEFAULT_POLICY_SET: PolicySetResponse = {
  id: "00000000-0000-0000-0000-000000000ddd",
  name: "Default",
  description: "",
  organization_id: "00000000-0000-0000-0000-000000000010",
  visibility: "private",
  is_approved: true,
  entries: [],
  created_at: "2026-05-16T00:00:00Z",
};

// `GET /policy-sets` returns slim items WITHOUT `entries` — see
// `PolicySetListItemResponse` in `domain/ports/api-gateway.ts`.
const DEFAULT_POLICY_SET_LIST_ITEM: PolicySetListItemResponse = {
  id: "00000000-0000-0000-0000-000000000ddd",
  name: "Default",
  description: "",
  organization_id: "00000000-0000-0000-0000-000000000010",
  visibility: "private",
  is_approved: true,
  created_at: "2026-05-16T00:00:00Z",
};

const DEFAULT_ALERT_DESTINATION: AlertNotificationDestinationResponse = {
  id: "00000000-0000-0000-0000-000000000999",
  channel: "slack",
  name: "default",
  is_active: true,
  is_default_target: false,
  version: "public",
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
};

const DEFAULT_CAMPAIGN_OVERRIDES: CampaignOverridesResponse = {
  campaign_id: "00000000-0000-0000-0000-000000000ccc",
  mode: "inherit",
  destination_ids: [],
};

const DEFAULT_TEST_WEBHOOK_RESPONSE: TestWebhookResponse = {
  success: true,
  response_status: 200,
  elapsed_ms: 12,
  error_code: null,
  response_body: "",
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
      return state.responses.updateOrg ?? ok<OrgResponse, ApiError>(DEFAULT_ORG);
    },
    async listOrgUsers() {
      push({ method: "listOrgUsers" });
      await Promise.resolve();
      return state.responses.listOrgUsers ?? ok<readonly UserResponse[], ApiError>([]);
    },
    async inviteUser(body) {
      push({ method: "inviteUser", body });
      await Promise.resolve();
      return state.responses.inviteUser ?? ok<UserResponse, ApiError>(DEFAULT_USER);
    },
    async updateUserRole(userId, body) {
      push({ method: "updateUserRole", userId, body });
      await Promise.resolve();
      return state.responses.updateUserRole ?? ok<null, ApiError>(null);
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
    async createCustomRole(body) {
      push({ method: "createCustomRole", body });
      await Promise.resolve();
      return state.responses.createCustomRole ?? ok<RoleResponse, ApiError>(DEFAULT_ROLE);
    },
    async listAccountLabels() {
      push({ method: "listAccountLabels" });
      await Promise.resolve();
      return (
        state.responses.listAccountLabels ?? ok<readonly LabelDefinitionResponse[], ApiError>([])
      );
    },
    async updateAccountLabels(body) {
      push({ method: "updateAccountLabels", body });
      await Promise.resolve();
      return (
        state.responses.updateAccountLabels ?? ok<readonly LabelDefinitionResponse[], ApiError>([])
      );
    },
    async getScanScreenshot(scanId, w) {
      push({ method: "getScanScreenshot", scanId, w });
      await Promise.resolve();
      return (
        state.responses.getScanScreenshot ??
        ok<BinaryDownload, ApiError>({
          bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
          contentType: "image/png",
        })
      );
    },
    async getScanCreativeScreenshot(scanId, w) {
      push({ method: "getScanCreativeScreenshot", scanId, w });
      await Promise.resolve();
      return (
        state.responses.getScanCreativeScreenshot ??
        ok<BinaryDownload, ApiError>({
          bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
          contentType: "image/png",
        })
      );
    },
    async getScanLandingScreenshot(scanId, landingOrd, w) {
      push({ method: "getScanLandingScreenshot", scanId, landingOrd, w });
      await Promise.resolve();
      return (
        state.responses.getScanLandingScreenshot ??
        ok<BinaryDownload, ApiError>({
          bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
          contentType: "image/png",
        })
      );
    },
    async getInvoicePdf(invoiceId) {
      push({ method: "getInvoicePdf", invoiceId });
      await Promise.resolve();
      return (
        state.responses.getInvoicePdf ??
        ok<BinaryDownload, ApiError>({
          bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
          contentType: "application/pdf",
        })
      );
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
        state.responses.createApiKey ?? ok<ApiKeyCreatedResponse, ApiError>(DEFAULT_API_KEY_CREATED)
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
    async listScanChildren(scanId, filters) {
      push({ method: "listScanChildren", scanId, filters });
      await Promise.resolve();
      return (
        state.responses.listScanChildren ??
        ok<PaginatedResponse<ScanBriefResponse>, ApiError>({
          items: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        })
      );
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
        state.responses.createBulkScans ?? ok<readonly ScanResponse[], ApiError>([DEFAULT_SCAN])
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
        state.responses.archiveCampaign ?? ok<CampaignResponse, ApiError>(DEFAULT_CAMPAIGN_ARCHIVED)
      );
    },
    async unarchiveCampaign(id) {
      push({ method: "unarchiveCampaign", id });
      await Promise.resolve();
      return state.responses.unarchiveCampaign ?? ok<CampaignResponse, ApiError>(DEFAULT_CAMPAIGN);
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
    async listCampaignsPicker(filters) {
      push({ method: "listCampaignsPicker", filters });
      await Promise.resolve();
      return (
        state.responses.listCampaignsPicker ??
        ok<readonly CampaignPickerItem[], ApiError>([DEFAULT_CAMPAIGN_PICKER_ITEM])
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
        ok<PaginatedResponse<ScanTileResponse>, ApiError>({
          items: [DEFAULT_SCAN_TILE],
          total: 1,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },

    // ── Campaign groups ────────────────────────────────────────
    async listCampaignGroups(filters = {}) {
      push({ method: "listCampaignGroups", filters });
      await Promise.resolve();
      return (
        state.responses.listCampaignGroups ?? ok<readonly CampaignGroupResponse[], ApiError>([])
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
        state.responses.createCampaignGroup ?? ok<CampaignGroupResponse, ApiError>(DEFAULT_GROUP)
      );
    },
    async updateCampaignGroup(id, body) {
      push({ method: "updateCampaignGroup", id, body });
      await Promise.resolve();
      return (
        state.responses.updateCampaignGroup ?? ok<CampaignGroupResponse, ApiError>(DEFAULT_GROUP)
      );
    },
    async runCampaignGroup(id) {
      push({ method: "runCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.runCampaignGroup ?? ok<GroupActionResponse, ApiError>(DEFAULT_GROUP_ACTION)
      );
    },
    async cancelCampaignGroup(id) {
      push({ method: "cancelCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.cancelCampaignGroup ??
        ok<GroupActionResponse, ApiError>(DEFAULT_GROUP_ACTION)
      );
    },
    async archiveCampaignGroup(id) {
      push({ method: "archiveCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.archiveCampaignGroup ??
        ok<GroupActionResponse, ApiError>(DEFAULT_GROUP_ACTION)
      );
    },
    async unarchiveCampaignGroup(id) {
      push({ method: "unarchiveCampaignGroup", id });
      await Promise.resolve();
      return (
        state.responses.unarchiveCampaignGroup ??
        ok<GroupActionResponse, ApiError>(DEFAULT_GROUP_ACTION)
      );
    },
    async pauseCampaignGroupSchedule(id) {
      push({ method: "pauseCampaignGroupSchedule", id });
      await Promise.resolve();
      return (
        state.responses.pauseCampaignGroupSchedule ??
        ok<CampaignGroupResponse, ApiError>(DEFAULT_GROUP_PAUSED)
      );
    },
    async resumeCampaignGroupSchedule(id) {
      push({ method: "resumeCampaignGroupSchedule", id });
      await Promise.resolve();
      return (
        state.responses.resumeCampaignGroupSchedule ??
        ok<CampaignGroupResponse, ApiError>(DEFAULT_GROUP)
      );
    },

    // ── Tag definitions ────────────────────────────────────────
    async listTags(filters) {
      push({ method: "listTags", filters });
      await Promise.resolve();
      return state.responses.listTags ?? ok<readonly TagDefinitionResponse[], ApiError>([]);
    },
    async getTagDefinition(slug) {
      push({ method: "getTagDefinition", slug });
      await Promise.resolve();
      return (
        state.responses.getTagDefinition ??
        ok<TagDefinitionDetailResponse, ApiError>(DEFAULT_TAG_DETAIL)
      );
    },
    async updateTagDefinition(slug, body) {
      push({ method: "updateTagDefinition", slug, body });
      await Promise.resolve();
      return state.responses.updateTagDefinition ?? ok<null, ApiError>(null);
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
    async getCustomRule(id) {
      push({ method: "getCustomRule", id });
      await Promise.resolve();
      return state.responses.getCustomRule ?? ok<CustomRuleResponse, ApiError>(DEFAULT_CUSTOM_RULE);
    },
    async createCustomRule(body) {
      push({ method: "createCustomRule", body });
      await Promise.resolve();
      return (
        state.responses.createCustomRule ?? ok<CustomRuleResponse, ApiError>(DEFAULT_CUSTOM_RULE)
      );
    },
    async updateCustomRule(id, body) {
      push({ method: "updateCustomRule", id, body });
      await Promise.resolve();
      return (
        state.responses.updateCustomRule ?? ok<CustomRuleResponse, ApiError>(DEFAULT_CUSTOM_RULE)
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
    async listPolicySets(filters) {
      push({ method: "listPolicySets", filters });
      await Promise.resolve();
      return (
        state.responses.listPolicySets ??
        ok<PaginatedResponse<PolicySetListItemResponse>, ApiError>({
          items: [DEFAULT_POLICY_SET_LIST_ITEM],
          total: 1,
          page: filters.page,
          limit: filters.limit,
        })
      );
    },
    async getPolicySet(id) {
      push({ method: "getPolicySet", id });
      await Promise.resolve();
      return state.responses.getPolicySet ?? ok<PolicySetResponse, ApiError>(DEFAULT_POLICY_SET);
    },
    async createPolicySet(body) {
      push({ method: "createPolicySet", body });
      await Promise.resolve();
      return state.responses.createPolicySet ?? ok<PolicySetResponse, ApiError>(DEFAULT_POLICY_SET);
    },
    async updatePolicySet(id, body) {
      push({ method: "updatePolicySet", id, body });
      await Promise.resolve();
      return state.responses.updatePolicySet ?? ok<PolicySetResponse, ApiError>(DEFAULT_POLICY_SET);
    },
    async deletePolicySet(id) {
      push({ method: "deletePolicySet", id });
      await Promise.resolve();
      return state.responses.deletePolicySet ?? ok<null, ApiError>(null);
    },
    async requestPolicySetApproval(id) {
      push({ method: "requestPolicySetApproval", id });
      await Promise.resolve();
      return state.responses.requestPolicySetApproval ?? ok<null, ApiError>(null);
    },

    // ── Custom taxonomies ──────────────────────────────────────
    async listCustomTaxonomies() {
      push({ method: "listCustomTaxonomies" });
      await Promise.resolve();
      return (
        state.responses.listCustomTaxonomies ?? ok<readonly CustomTaxonomyListItem[], ApiError>([])
      );
    },
    async getCustomTaxonomy(id) {
      push({ method: "getCustomTaxonomy", id });
      await Promise.resolve();
      return (
        state.responses.getCustomTaxonomy ??
        ok<CustomTaxonomyResponse, ApiError>(DEFAULT_CUSTOM_TAXONOMY)
      );
    },
    async createCustomTaxonomy(body) {
      push({ method: "createCustomTaxonomy", body });
      await Promise.resolve();
      return (
        state.responses.createCustomTaxonomy ??
        ok<CustomTaxonomyResponse, ApiError>(DEFAULT_CUSTOM_TAXONOMY)
      );
    },
    async updateCustomTaxonomy(id, body) {
      push({ method: "updateCustomTaxonomy", id, body });
      await Promise.resolve();
      return (
        state.responses.updateCustomTaxonomy ??
        ok<CustomTaxonomyResponse, ApiError>(DEFAULT_CUSTOM_TAXONOMY)
      );
    },
    async deleteCustomTaxonomy(id) {
      push({ method: "deleteCustomTaxonomy", id });
      await Promise.resolve();
      return state.responses.deleteCustomTaxonomy ?? ok<null, ApiError>(null);
    },
    async restoreCustomTaxonomy(id) {
      push({ method: "restoreCustomTaxonomy", id });
      await Promise.resolve();
      return (
        state.responses.restoreCustomTaxonomy ??
        ok<CustomTaxonomyResponse, ApiError>(DEFAULT_CUSTOM_TAXONOMY)
      );
    },
    async parseCustomTaxonomyText(body) {
      push({ method: "parseCustomTaxonomyText", body });
      await Promise.resolve();
      return (
        state.responses.parseCustomTaxonomyText ??
        ok<ParseTaxonomyTextResponse, ApiError>({ nodes: [], warnings: [] })
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
          escalated: 0,
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
        ok<WebhookCreatedResponse, ApiError>(DEFAULT_WEBHOOK_CREATED)
      );
    },
    async updateWebhook(id, body) {
      push({ method: "updateWebhook", id, body });
      await Promise.resolve();
      return state.responses.updateWebhook ?? ok<WebhookResponse, ApiError>(DEFAULT_WEBHOOK);
    },
    async deleteWebhook(id) {
      push({ method: "deleteWebhook", id });
      await Promise.resolve();
      return state.responses.deleteWebhook ?? ok<null, ApiError>(null);
    },
    async testWebhook(endpointId, body) {
      push({ method: "testWebhook", endpointId, body });
      await Promise.resolve();
      return (
        state.responses.testWebhook ??
        ok<TestWebhookResponse, ApiError>(DEFAULT_TEST_WEBHOOK_RESPONSE)
      );
    },
    async rotateWebhookSecret(endpointId) {
      push({ method: "rotateWebhookSecret", endpointId });
      await Promise.resolve();
      return (
        state.responses.rotateWebhookSecret ??
        ok<WebhookCreatedResponse, ApiError>(DEFAULT_WEBHOOK_ROTATED)
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
          current_plan_is_custom: false,
          credit_limit_micros: 0,
          effective_minimum_balance_micros: 0,
          scheduled_next_plan_id: null,
          scheduled_next_plan_name: null,
          scheduled_effective_at: null,
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
        ok<readonly AlertNotificationDestinationResponse[], ApiError>([DEFAULT_ALERT_DESTINATION])
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
      return state.responses.setAlertDestinationVersion ?? ok<null, ApiError>(null);
    },
    async getCampaignAlertOverrides(campaignId) {
      push({ method: "getCampaignAlertOverrides", campaignId });
      await Promise.resolve();
      return (
        state.responses.getCampaignAlertOverrides ??
        ok<CampaignOverridesResponse, ApiError>(DEFAULT_CAMPAIGN_OVERRIDES)
      );
    },
    async setCampaignAlertOverrides(campaignId, body) {
      push({ method: "setCampaignAlertOverrides", campaignId, body });
      await Promise.resolve();
      return state.responses.setCampaignAlertOverrides ?? ok<null, ApiError>(null);
    },
  };
}

export function makeApiError(kind: ApiError["kind"], detail: string, code?: string): ApiError {
  switch (kind) {
    case "unauthorized":
    case "not-found":
    case "rate-limited":
    case "upstream":
      return { kind, detail };
    case "forbidden":
    case "invalid-input":
      return code === undefined ? { kind, detail } : { kind, detail, code };
  }
}

export { err, ok };
