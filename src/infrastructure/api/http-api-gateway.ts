/**
 * Production {@link ApiGateway} adapter. Calls the Kaminari Ad
 * `/api/v1` surface over HTTPS via undici.
 *
 * Tenant-isolation contract: built per-request in HTTP mode, holding
 * exactly ONE caller's Bearer in a private closure. Garbage-collected
 * when the request ends. The factory function is never used to build a
 * singleton.
 *
 * Per-endpoint parsing logic lives in `./parsers/*`; error mapping
 * lives in `./error-mapping`. This file is the thin shell that ties
 * those together with the actual `undici` request.
 */

import { request as undiciRequest, type Dispatcher } from "undici";

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
} from "../../domain/ports/api-gateway.js";
import type { Logger } from "../../domain/ports/logger.js";
import type { BearerToken } from "../../domain/value-objects/bearer-token.js";
import type { RequestId } from "../../domain/value-objects/request-id.js";
import { err, type Result } from "../../shared/result.js";

import { toApiError } from "./error-mapping.js";
import { parseAlertPage } from "./parsers/parse-alert.js";
import { parseApiKeyList } from "./parsers/parse-api-key.js";
import { parseBillingSummary } from "./parsers/parse-billing-summary.js";
import { parseCampaign, parseCampaignPage } from "./parsers/parse-campaign.js";
import {
  parseCampaignGroup,
  parseCampaignGroupPage,
} from "./parsers/parse-campaign-group.js";
import { parseIntField } from "./parsers/parse-count-envelope.js";
import { parseCustomRule, parseCustomRulePage } from "./parsers/parse-custom-rule.js";
import { parseEmpty } from "./parsers/parse-empty.js";
import { parseEmulatorList } from "./parsers/parse-emulator.js";
import {
  parseAlertDestination,
  parseAlertStats,
  parseApiKeyCreated,
  parseArchiveOrCancel,
  parseArrayOf,
  parseBalanceTx,
  parseCampaignAlertOverrides,
  parseInvoice,
  parseOrg,
  parseOrgRole,
  parseOrgUser,
  parsePageOf,
  parseReplayResponse,
  parseRunCommand,
  parseScanTag,
  parseTagDetail,
  parseTestRule,
  parseUsage,
  parseUsageSummary,
  parseWebhookDelivery,
  parseWebhookEventCatalog,
} from "./parsers/parse-generic.js";
import { parseGeoList } from "./parsers/parse-geo-list.js";
import { parseMe } from "./parsers/parse-me.js";
import {
  parsePolicySet,
  parsePolicySetList,
} from "./parsers/parse-policy-set.js";
import { parseRun, parseRunPage } from "./parsers/parse-run.js";
import { parseScan, parseScanList } from "./parsers/parse-scan.js";
import { parseScanPage } from "./parsers/parse-scan-page.js";
import { parseTagPage } from "./parsers/parse-tag.js";
import {
  parseWebhook,
  parseWebhookCreated,
  parseWebhookList,
} from "./parsers/parse-webhook.js";

export interface HttpApiGatewayConfig {
  readonly baseUrl: string;
  readonly bearer: BearerToken;
  readonly requestId: RequestId;
  readonly logger: Logger;
  /**
   * Optional undici dispatcher — tests pass a `MockAgent`-backed one;
   * production uses the default global agent.
   */
  readonly dispatcher?: Dispatcher;
}

/**
 * Build a fresh `ApiGateway` for one logical request scope.
 */
export function createHttpApiGateway(config: HttpApiGatewayConfig): ApiGateway {
  const { baseUrl, bearer, requestId, logger, dispatcher } = config;

  async function call<T>(
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
    path: string,
    body: unknown,
    parse: (raw: unknown) => Result<T, ApiError>
  ): Promise<Result<T, ApiError>> {
    const url = `${baseUrl}${path}`;
    const startedAtMs = Date.now();
    let res: Awaited<ReturnType<typeof undiciRequest>>;
    try {
      const baseOptions = {
        method,
        headers: {
          authorization: bearer.toAuthorizationHeader(),
          "content-type": "application/json",
          accept: "application/json",
          "user-agent": "kaminari-ad-mcp",
          "x-request-id": requestId,
        },
      };
      const withBody =
        body === undefined ? baseOptions : { ...baseOptions, body: JSON.stringify(body) };
      const withDispatcher =
        dispatcher === undefined ? withBody : { ...withBody, dispatcher };
      res = await undiciRequest(url, withDispatcher);
    } catch (cause) {
      logger.warn({ api_path: path, elapsed_ms: Date.now() - startedAtMs }, "api.network_error");
      return err({
        kind: "upstream",
        detail: cause instanceof Error ? cause.message : "network error",
      });
    }

    const status = res.statusCode;
    let parsedBody: unknown;
    try {
      parsedBody = await res.body.json();
    } catch {
      parsedBody = undefined;
    }
    logger.info(
      { api_path: path, api_status: status, elapsed_ms: Date.now() - startedAtMs },
      "api.done"
    );

    if (status >= 200 && status < 300) {
      return parse(parsedBody);
    }
    return err(toApiError(status, parsedBody, res.headers["retry-after"]));
  }

  return {
    getMe(): Promise<Result<MeResponse, ApiError>> {
      return call("GET", "/api/v1/account", undefined, parseMe);
    },
    listScans(
      filters: ListScansFilters
    ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>> {
      return call("GET", `/api/v1/scans?${buildScanQuery(filters)}`, undefined, parseScanPage);
    },
    getScan(scanId: string): Promise<Result<ScanResponse, ApiError>> {
      return call("GET", `/api/v1/scans/${encodeURIComponent(scanId)}`, undefined, parseScan);
    },
    createScan(body: CreateScanRequest): Promise<Result<ScanResponse, ApiError>> {
      return call("POST", "/api/v1/scans", body, parseScan);
    },
    createBulkScans(
      body: CreateBulkScansRequest
    ): Promise<Result<readonly ScanResponse[], ApiError>> {
      return call("POST", "/api/v1/scans/bulk", body, parseScanList);
    },
    recheckScans(body: RecheckRequest): Promise<Result<RecheckResponse, ApiError>> {
      return call("POST", "/api/v1/scans/recheck", body, (raw) =>
        parseIntField(raw, "queued_count")
      );
    },
    cancelScan(scanId: string): Promise<Result<CancelPendingResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/scans/${encodeURIComponent(scanId)}/cancel`,
        undefined,
        (raw) => parseIntField(raw, "cancelled_count")
      );
    },
    listGeos(): Promise<Result<readonly GeoResponse[], ApiError>> {
      return call("GET", "/api/v1/geos", undefined, parseGeoList);
    },
    listCampaigns(filters): Promise<Result<PaginatedResponse<CampaignResponse>, ApiError>> {
      return call("GET", `/api/v1/campaigns?${buildPagedQuery({ ...filters })}`, undefined, parseCampaignPage);
    },
    getCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call("GET", `/api/v1/campaigns/${encodeURIComponent(id)}`, undefined, parseCampaign);
    },
    createCampaign(body: CreateCampaignRequest): Promise<Result<CampaignResponse, ApiError>> {
      return call("POST", "/api/v1/campaigns", body, parseCampaign);
    },
    updateCampaign(
      id: string,
      body: UpdateCampaignRequest
    ): Promise<Result<CampaignResponse, ApiError>> {
      return call("PATCH", `/api/v1/campaigns/${encodeURIComponent(id)}`, body, parseCampaign);
    },
    archiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaigns/${encodeURIComponent(id)}/archive`,
        undefined,
        parseCampaign
      );
    },
    listRuns(filters: ListRunsFilters): Promise<Result<PaginatedResponse<RunResponse>, ApiError>> {
      return call("GET", `/api/v1/runs?${buildPagedQuery({ ...filters })}`, undefined, parseRunPage);
    },
    getRun(id: string): Promise<Result<RunResponse, ApiError>> {
      return call("GET", `/api/v1/runs/${encodeURIComponent(id)}`, undefined, parseRun);
    },
    listCampaignGroups(filters): Promise<Result<PaginatedResponse<CampaignGroupResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/campaign-groups?${buildPagedQuery({ ...filters })}`,
        undefined,
        parseCampaignGroupPage
      );
    },
    getCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "GET",
        `/api/v1/campaign-groups/${encodeURIComponent(id)}`,
        undefined,
        parseCampaignGroup
      );
    },
    createCampaignGroup(
      body: CreateCampaignGroupRequest
    ): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call("POST", "/api/v1/campaign-groups", body, parseCampaignGroup);
    },
    updateCampaignGroup(
      id: string,
      body: UpdateCampaignGroupRequest
    ): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "PATCH",
        `/api/v1/campaign-groups/${encodeURIComponent(id)}`,
        body,
        parseCampaignGroup
      );
    },
    listEmulators(): Promise<Result<readonly EmulatorResponse[], ApiError>> {
      return call("GET", "/api/v1/emulators", undefined, parseEmulatorList);
    },
    listTags(filters): Promise<Result<PaginatedResponse<TagDefinitionResponse>, ApiError>> {
      return call("GET", `/api/v1/tags?${buildPagedQuery({ ...filters })}`, undefined, parseTagPage);
    },
    listCustomRules(filters): Promise<Result<PaginatedResponse<CustomRuleResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/custom-rules?${buildPagedQuery({ ...filters })}`,
        undefined,
        parseCustomRulePage
      );
    },
    createCustomRule(body: CreateCustomRuleRequest): Promise<Result<CustomRuleResponse, ApiError>> {
      return call("POST", "/api/v1/custom-rules", body, parseCustomRule);
    },
    deleteCustomRule(id: string): Promise<Result<null, ApiError>> {
      return call("DELETE", `/api/v1/custom-rules/${encodeURIComponent(id)}`, undefined, parseEmpty);
    },
    listPolicySets(): Promise<Result<readonly PolicySetSummary[], ApiError>> {
      return call("GET", "/api/v1/policy-sets", undefined, parsePolicySetList);
    },
    getPolicySet(id: string): Promise<Result<PolicySetResponse, ApiError>> {
      return call("GET", `/api/v1/policy-sets/${encodeURIComponent(id)}`, undefined, parsePolicySet);
    },
    createPolicySet(body: CreatePolicySetRequest): Promise<Result<PolicySetResponse, ApiError>> {
      return call("POST", "/api/v1/policy-sets", body, parsePolicySet);
    },
    listAlerts(filters: ListAlertsFilters): Promise<Result<PaginatedResponse<AlertResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/alerts?${buildPagedQuery({ ...filters })}`,
        undefined,
        parseAlertPage
      );
    },
    listWebhooks(): Promise<Result<readonly WebhookResponse[], ApiError>> {
      return call("GET", "/api/v1/webhooks", undefined, parseWebhookList);
    },
    createWebhook(body: CreateWebhookRequest): Promise<Result<WebhookCreatedResponse, ApiError>> {
      return call("POST", "/api/v1/webhooks", body, parseWebhookCreated);
    },
    deleteWebhook(id: string): Promise<Result<null, ApiError>> {
      return call("DELETE", `/api/v1/webhooks/${encodeURIComponent(id)}`, undefined, parseEmpty);
    },
    getBillingSummary(): Promise<Result<BillingSummaryResponse, ApiError>> {
      return call("GET", "/api/v1/billing", undefined, parseBillingSummary);
    },
    listApiKeys(): Promise<Result<readonly ApiKeyResponse[], ApiError>> {
      return call("GET", "/api/v1/account/api-keys", undefined, parseApiKeyList);
    },
    createApiKey(body: CreateApiKeyRequest): Promise<Result<ApiKeyCreatedResponse, ApiError>> {
      return call("POST", "/api/v1/account/api-keys", body, parseApiKeyCreated);
    },
    revokeApiKey(keyId: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        `/api/v1/account/api-keys/${encodeURIComponent(keyId)}`,
        undefined,
        parseEmpty
      );
    },
    updateOrg(body: UpdateOrgRequest): Promise<Result<OrgResponse, ApiError>> {
      return call("PATCH", "/api/v1/account", body, parseOrg);
    },
    listOrgUsers(): Promise<Result<readonly OrgUserResponse[], ApiError>> {
      return call("GET", "/api/v1/account/users", undefined, parseArrayOf(parseOrgUser));
    },
    inviteUser(body: InviteUserRequest): Promise<Result<OrgUserResponse, ApiError>> {
      return call("POST", "/api/v1/account/users/invite", body, parseOrgUser);
    },
    updateUserRole(
      userId: string,
      body: UpdateUserRoleRequest
    ): Promise<Result<OrgUserResponse, ApiError>> {
      return call(
        "PATCH",
        `/api/v1/account/users/${encodeURIComponent(userId)}/role`,
        body,
        parseOrgUser
      );
    },
    removeUser(userId: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        `/api/v1/account/users/${encodeURIComponent(userId)}`,
        undefined,
        parseEmpty
      );
    },
    transferOwnership(userId: string): Promise<Result<null, ApiError>> {
      return call(
        "POST",
        `/api/v1/account/users/${encodeURIComponent(userId)}/transfer-ownership`,
        undefined,
        parseEmpty
      );
    },
    listOrgRoles(): Promise<Result<readonly OrgRoleResponse[], ApiError>> {
      return call("GET", "/api/v1/account/roles", undefined, parseArrayOf(parseOrgRole));
    },
    listRunScans(
      runId: string,
      filters: { readonly page: number; readonly limit: number }
    ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/runs/${encodeURIComponent(runId)}/scans?${buildPagedQuery({ ...filters })}`,
        undefined,
        parseScanPage
      );
    },
    listScanTags(scanId: string): Promise<Result<readonly ScanTagResponse[], ApiError>> {
      return call(
        "GET",
        `/api/v1/scans/${encodeURIComponent(scanId)}/tags`,
        undefined,
        parseArrayOf(parseScanTag)
      );
    },
    getTagDefinition(
      slug: string
    ): Promise<Result<TagDefinitionWithDetailResponse, ApiError>> {
      return call("GET", `/api/v1/tag-definitions/${encodeURIComponent(slug)}`, undefined, parseTagDetail);
    },
    updateTagDefinition(
      slug: string,
      body: UpdateTagDefinitionRequest
    ): Promise<Result<TagDefinitionWithDetailResponse, ApiError>> {
      return call(
        "PATCH",
        `/api/v1/tag-definitions/${encodeURIComponent(slug)}`,
        body,
        parseTagDetail
      );
    },
    deleteTagDefinition(slug: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        `/api/v1/tag-definitions/${encodeURIComponent(slug)}`,
        undefined,
        parseEmpty
      );
    },
    getCustomRule(id: string): Promise<Result<CustomRuleResponse, ApiError>> {
      return call("GET", `/api/v1/custom-rules/${encodeURIComponent(id)}`, undefined, parseCustomRule);
    },
    updateCustomRule(
      id: string,
      body: UpdateCustomRuleRequest
    ): Promise<Result<CustomRuleResponse, ApiError>> {
      return call("PUT", `/api/v1/custom-rules/${encodeURIComponent(id)}`, body, parseCustomRule);
    },
    testCustomRule(
      body: TestCustomRuleRequest
    ): Promise<Result<TestCustomRuleResponse, ApiError>> {
      return call("POST", "/api/v1/custom-rules/test", body, parseTestRule);
    },
    updatePolicySet(
      id: string,
      body: UpdatePolicySetRequest
    ): Promise<Result<PolicySetResponse, ApiError>> {
      return call("PUT", `/api/v1/policy-sets/${encodeURIComponent(id)}`, body, parsePolicySet);
    },
    deletePolicySet(id: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        `/api/v1/policy-sets/${encodeURIComponent(id)}`,
        undefined,
        parseEmpty
      );
    },
    requestPolicySetApproval(id: string): Promise<Result<PolicySetResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/policy-sets/${encodeURIComponent(id)}/request-approval`,
        undefined,
        parsePolicySet
      );
    },
    updateAlertStatus(
      alertId: string,
      body: UpdateAlertStatusRequest
    ): Promise<Result<null, ApiError>> {
      return call(
        "PATCH",
        `/api/v1/alerts/${encodeURIComponent(alertId)}/status`,
        body,
        parseEmpty
      );
    },
    getAlertStats(): Promise<Result<AlertStatsResponse, ApiError>> {
      return call("GET", "/api/v1/alerts/stats", undefined, parseAlertStats);
    },
    runCampaign(id: string): Promise<Result<RunCommandResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaigns/${encodeURIComponent(id)}/run`,
        undefined,
        parseRunCommand
      );
    },
    cancelCampaign(id: string): Promise<Result<ArchiveOrCancelResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaigns/${encodeURIComponent(id)}/cancel`,
        undefined,
        parseArchiveOrCancel
      );
    },
    unarchiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaigns/${encodeURIComponent(id)}/unarchive`,
        undefined,
        parseCampaign
      );
    },
    listCampaignRuns(
      campaignId: string,
      filters: { readonly page: number; readonly limit: number }
    ): Promise<Result<PaginatedResponse<RunResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/campaigns/${encodeURIComponent(campaignId)}/runs?${buildPagedQuery({ ...filters })}`,
        undefined,
        parseRunPage
      );
    },
    runCampaignGroup(id: string): Promise<Result<RunCommandResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${encodeURIComponent(id)}/run`,
        undefined,
        parseRunCommand
      );
    },
    cancelCampaignGroup(id: string): Promise<Result<ArchiveOrCancelResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${encodeURIComponent(id)}/cancel`,
        undefined,
        parseArchiveOrCancel
      );
    },
    archiveCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${encodeURIComponent(id)}/archive`,
        undefined,
        parseCampaignGroup
      );
    },
    unarchiveCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${encodeURIComponent(id)}/unarchive`,
        undefined,
        parseCampaignGroup
      );
    },
    pauseCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${encodeURIComponent(id)}/pause-schedule`,
        undefined,
        parseCampaignGroup
      );
    },
    resumeCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${encodeURIComponent(id)}/resume-schedule`,
        undefined,
        parseCampaignGroup
      );
    },
    cancelRun(id: string): Promise<Result<ArchiveOrCancelResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/runs/${encodeURIComponent(id)}/cancel`,
        undefined,
        parseArchiveOrCancel
      );
    },
    listUsage(
      filters: ListUsageFilters
    ): Promise<Result<PaginatedResponse<UsageResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/billing/usage?${buildPagedQuery({ ...filters })}`,
        undefined,
        parsePageOf(parseUsage)
      );
    },
    getUsageSummary(): Promise<Result<UsagePeriodSummaryResponse, ApiError>> {
      return call("GET", "/api/v1/billing/usage/summary", undefined, parseUsageSummary);
    },
    listBalanceHistory(filters): Promise<Result<PaginatedResponse<BalanceTransactionResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/billing/history?${buildPagedQuery({ ...filters })}`,
        undefined,
        parsePageOf(parseBalanceTx)
      );
    },
    listInvoices(filters): Promise<Result<PaginatedResponse<InvoiceResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/invoices?${buildPagedQuery({ ...filters })}`,
        undefined,
        parsePageOf(parseInvoice)
      );
    },
    getWebhook(id: string): Promise<Result<WebhookResponse, ApiError>> {
      return call("GET", `/api/v1/webhooks/${encodeURIComponent(id)}`, undefined, parseWebhook);
    },
    updateWebhook(
      id: string,
      body: UpdateWebhookRequest
    ): Promise<Result<WebhookResponse, ApiError>> {
      return call("PATCH", `/api/v1/webhooks/${encodeURIComponent(id)}`, body, parseWebhook);
    },
    listWebhookEventTypes(): Promise<Result<readonly WebhookEventCatalogEntry[], ApiError>> {
      return call("GET", "/api/v1/webhooks/event-types", undefined, parseWebhookEventCatalog);
    },
    listWebhookDeliveries(
      endpointId: string,
      filters: { readonly page: number; readonly limit: number }
    ): Promise<Result<PaginatedResponse<WebhookDeliveryAttemptResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/webhooks/${encodeURIComponent(endpointId)}/deliveries?${buildPagedQuery({ ...filters })}`,
        undefined,
        parsePageOf(parseWebhookDelivery)
      );
    },
    testWebhook(endpointId: string): Promise<Result<null, ApiError>> {
      return call(
        "POST",
        `/api/v1/webhooks/${encodeURIComponent(endpointId)}/test`,
        undefined,
        parseEmpty
      );
    },
    rotateWebhookSecret(endpointId: string): Promise<Result<WebhookCreatedResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/webhooks/${encodeURIComponent(endpointId)}/rotate-secret`,
        undefined,
        parseWebhookCreated
      );
    },
    replayWebhookDelivery(attemptId: string): Promise<Result<null, ApiError>> {
      return call(
        "POST",
        `/api/v1/webhooks/deliveries/${encodeURIComponent(attemptId)}/replay`,
        undefined,
        parseEmpty
      );
    },
    bulkReplayWebhook(
      endpointId: string,
      body: { readonly attempt_ids?: readonly string[] }
    ): Promise<Result<{ readonly replayed_count: number }, ApiError>> {
      return call(
        "POST",
        `/api/v1/webhooks/${encodeURIComponent(endpointId)}/replay`,
        body,
        parseReplayResponse
      );
    },
    listAlertDestinations(): Promise<Result<readonly AlertNotificationDestination[], ApiError>> {
      return call(
        "GET",
        "/api/v1/alert-notifications/destinations",
        undefined,
        parseArrayOf(parseAlertDestination)
      );
    },
    deleteAlertDestination(id: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        `/api/v1/alert-notifications/destinations/${encodeURIComponent(id)}`,
        undefined,
        parseEmpty
      );
    },
    setAlertDestinationVersion(
      id: string,
      body: { readonly version: number }
    ): Promise<Result<AlertNotificationDestination, ApiError>> {
      return call(
        "PATCH",
        `/api/v1/alert-notifications/destinations/${encodeURIComponent(id)}/version`,
        body,
        parseAlertDestination
      );
    },
    getCampaignAlertOverrides(
      campaignId: string
    ): Promise<Result<CampaignAlertOverrides, ApiError>> {
      return call(
        "GET",
        `/api/v1/alert-notifications/campaigns/${encodeURIComponent(campaignId)}/overrides`,
        undefined,
        parseCampaignAlertOverrides
      );
    },
    setCampaignAlertOverrides(
      campaignId: string,
      body: SetCampaignOverridesRequest
    ): Promise<Result<CampaignAlertOverrides, ApiError>> {
      return call(
        "PUT",
        `/api/v1/alert-notifications/campaigns/${encodeURIComponent(campaignId)}/overrides`,
        body,
        parseCampaignAlertOverrides
      );
    },
  };
}

function buildScanQuery(filters: ListScansFilters): string {
  return buildPagedQuery({ ...filters });
}

function buildPagedQuery(filters: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;
    qs.set(key, String(value));
  }
  return qs.toString();
}
