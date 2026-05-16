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
 *
 * URLs and DTO shapes are validated by the generated openapi.ts types
 * (Pick projections in `domain/ports/api-gateway.ts`). A drift between
 * MCP and API forces a regen + tsc failure.
 */

import { type Dispatcher, request as undiciRequest } from "undici";

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
import { parseCampaignGroup, parseCampaignGroupPage } from "./parsers/parse-campaign-group.js";
import { parseIntField } from "./parsers/parse-count-envelope.js";
import { parseCustomRule, parseCustomRuleArray } from "./parsers/parse-custom-rule.js";
import { parseEmpty } from "./parsers/parse-empty.js";
import { parseEmulatorList } from "./parsers/parse-emulator.js";
import {
  parseAlertDestination,
  parseAlertStats,
  parseApiKeyCreated,
  parseArrayOf,
  parseBalanceTx,
  parseBulkReplay,
  parseCampaignAlertOverrides,
  parseEventCatalog,
  parseGroupAction,
  parseInvoice,
  parseOrg,
  parsePageOf,
  parseRole,
  parseRuleTest,
  parseScanTag,
  parseTagDetail,
  parseUsage,
  parseUsageSummary,
  parseUser,
  parseWebhookDelivery,
} from "./parsers/parse-generic.js";
import { parseGeoList } from "./parsers/parse-geo-list.js";
import { parsePolicySet, parsePolicySetList } from "./parsers/parse-policy-set.js";
import { parseRun } from "./parsers/parse-run.js";
import { parseScan, parseScanArray } from "./parsers/parse-scan.js";
import { parseScanPage } from "./parsers/parse-scan-page.js";
import { parseTagDefinitionArray } from "./parsers/parse-tag.js";
import { parseWebhook, parseWebhookCreated, parseWebhookList } from "./parsers/parse-webhook.js";

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

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/** Build a fresh `ApiGateway` for one logical request scope. */
export function createHttpApiGateway(config: HttpApiGatewayConfig): ApiGateway {
  const { baseUrl, bearer, requestId, logger, dispatcher } = config;

  async function call<T>(
    method: Method,
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
      const withDispatcher = dispatcher === undefined ? withBody : { ...withBody, dispatcher };
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

  const enc = encodeURIComponent;

  return {
    // ── Account ───────────────────────────────────────────────────
    async getAccount(): Promise<Result<OrgResponse, ApiError>> {
      return call("GET", "/api/v1/account", undefined, parseOrg);
    },
    async updateOrg(body: UpdateOrgRequest): Promise<Result<OrgResponse, ApiError>> {
      return call("PATCH", "/api/v1/account", body, parseOrg);
    },
    async listOrgUsers(): Promise<Result<readonly UserResponse[], ApiError>> {
      return call("GET", "/api/v1/account/users", undefined, parseArrayOf(parseUser));
    },
    async inviteUser(body: InviteUserRequest): Promise<Result<UserResponse, ApiError>> {
      return call("POST", "/api/v1/account/users/invite", body, parseUser);
    },
    async updateUserRole(
      userId: string,
      body: UpdateUserRoleRequest
    ): Promise<Result<UserResponse, ApiError>> {
      return call("PATCH", `/api/v1/account/users/${enc(userId)}/role`, body, parseUser);
    },
    async removeUser(userId: string): Promise<Result<null, ApiError>> {
      return call("DELETE", `/api/v1/account/users/${enc(userId)}`, undefined, parseEmpty);
    },
    async transferOwnership(userId: string): Promise<Result<null, ApiError>> {
      return call(
        "POST",
        `/api/v1/account/users/${enc(userId)}/transfer-ownership`,
        undefined,
        parseEmpty
      );
    },
    async listOrgRoles(): Promise<Result<readonly RoleResponse[], ApiError>> {
      return call("GET", "/api/v1/account/roles", undefined, parseArrayOf(parseRole));
    },
    async listApiKeys(): Promise<Result<readonly ApiKeyResponse[], ApiError>> {
      return call("GET", "/api/v1/account/api-keys", undefined, parseApiKeyList);
    },
    async createApiKey(
      body: CreateApiKeyRequest
    ): Promise<Result<ApiKeyCreatedResponse, ApiError>> {
      return call("POST", "/api/v1/account/api-keys", body, parseApiKeyCreated);
    },
    async revokeApiKey(keyId: string): Promise<Result<null, ApiError>> {
      return call("DELETE", `/api/v1/account/api-keys/${enc(keyId)}`, undefined, parseEmpty);
    },

    // ── Scans ─────────────────────────────────────────────────────
    async listScans(
      filters: ListScansFilters
    ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>> {
      return call("GET", `/api/v1/scans?${buildQuery(filters)}`, undefined, parseScanPage);
    },
    async getScan(scanId: string): Promise<Result<ScanResponse, ApiError>> {
      return call("GET", `/api/v1/scans/${enc(scanId)}`, undefined, parseScan);
    },
    async createScan(body: CreateScanRequest): Promise<Result<ScanResponse, ApiError>> {
      return call("POST", "/api/v1/scans", body, parseScan);
    },
    async createBulkScans(
      body: BulkScanRequest
    ): Promise<Result<readonly ScanResponse[], ApiError>> {
      return call("POST", "/api/v1/scans/bulk", body, parseScanArray);
    },
    async recheckScans(body: RecheckRequest): Promise<Result<RecheckResponse, ApiError>> {
      return call("POST", "/api/v1/scans/recheck", body, (raw) =>
        parseIntField(raw, "queued_count")
      );
    },
    async cancelScan(scanId: string): Promise<Result<CancelPendingResponse, ApiError>> {
      return call("POST", `/api/v1/scans/${enc(scanId)}/cancel`, undefined, (raw) =>
        parseIntField(raw, "cancelled_count")
      );
    },
    async listScanTags(scanId: string): Promise<Result<readonly ScanTagResponse[], ApiError>> {
      return call(
        "GET",
        `/api/v1/scans/${enc(scanId)}/tags`,
        undefined,
        parseArrayOf(parseScanTag)
      );
    },

    // ── Geos / emulators ──────────────────────────────────────────
    async listGeos(): Promise<Result<readonly GeoResponse[], ApiError>> {
      return call("GET", "/api/v1/geos", undefined, parseGeoList);
    },
    async listEmulators(): Promise<Result<readonly EmulatorResponse[], ApiError>> {
      return call("GET", "/api/v1/emulators", undefined, parseEmulatorList);
    },

    // ── Campaigns ─────────────────────────────────────────────────
    async listCampaigns(
      filters: ListCampaignsFilters
    ): Promise<Result<PaginatedResponse<CampaignResponse>, ApiError>> {
      return call("GET", `/api/v1/campaigns?${buildQuery(filters)}`, undefined, parseCampaignPage);
    },
    async getCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call("GET", `/api/v1/campaigns/${enc(id)}`, undefined, parseCampaign);
    },
    async createCampaign(body: CreateCampaignRequest): Promise<Result<CampaignResponse, ApiError>> {
      return call("POST", "/api/v1/campaigns", body, parseCampaign);
    },
    async updateCampaign(
      id: string,
      body: UpdateCampaignRequest
    ): Promise<Result<CampaignResponse, ApiError>> {
      return call("PATCH", `/api/v1/campaigns/${enc(id)}`, body, parseCampaign);
    },
    async runCampaign(id: string): Promise<Result<RunResponse, ApiError>> {
      return call("POST", `/api/v1/campaigns/${enc(id)}/run`, undefined, parseRun);
    },
    async archiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call("POST", `/api/v1/campaigns/${enc(id)}/archive`, undefined, parseCampaign);
    },
    async unarchiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call("POST", `/api/v1/campaigns/${enc(id)}/unarchive`, undefined, parseCampaign);
    },
    async cancelCampaign(id: string): Promise<Result<CancelPendingResponse, ApiError>> {
      return call("POST", `/api/v1/campaigns/${enc(id)}/cancel`, undefined, (raw) =>
        parseIntField(raw, "cancelled_count")
      );
    },
    async listCampaignRuns(
      campaignId: string,
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<RunResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/campaigns/${enc(campaignId)}/runs?${buildQuery(filters)}`,
        undefined,
        parsePageOf(parseRun)
      );
    },

    // ── Runs ──────────────────────────────────────────────────────
    async getRun(id: string): Promise<Result<RunResponse, ApiError>> {
      return call("GET", `/api/v1/runs/${enc(id)}`, undefined, parseRun);
    },
    async cancelRun(id: string): Promise<Result<CancelPendingResponse, ApiError>> {
      return call("POST", `/api/v1/runs/${enc(id)}/cancel`, undefined, (raw) =>
        parseIntField(raw, "cancelled_count")
      );
    },
    async listRunScans(
      runId: string,
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/runs/${enc(runId)}/scans?${buildQuery(filters)}`,
        undefined,
        parseScanPage
      );
    },

    // ── Campaign groups ───────────────────────────────────────────
    async listCampaignGroups(
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<CampaignGroupResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/campaign-groups?${buildQuery(filters)}`,
        undefined,
        parseCampaignGroupPage
      );
    },
    async getCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call("GET", `/api/v1/campaign-groups/${enc(id)}`, undefined, parseCampaignGroup);
    },
    async createCampaignGroup(
      body: CreateCampaignGroupRequest
    ): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call("POST", "/api/v1/campaign-groups", body, parseCampaignGroup);
    },
    async updateCampaignGroup(
      id: string,
      body: UpdateCampaignGroupRequest
    ): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call("PATCH", `/api/v1/campaign-groups/${enc(id)}`, body, parseCampaignGroup);
    },
    async runCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>> {
      return call("POST", `/api/v1/campaign-groups/${enc(id)}/run`, undefined, parseGroupAction);
    },
    async cancelCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>> {
      return call("POST", `/api/v1/campaign-groups/${enc(id)}/cancel`, undefined, parseGroupAction);
    },
    async archiveCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${enc(id)}/archive`,
        undefined,
        parseCampaignGroup
      );
    },
    async unarchiveCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${enc(id)}/unarchive`,
        undefined,
        parseCampaignGroup
      );
    },
    async pauseCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${enc(id)}/pause-schedule`,
        undefined,
        parseCampaignGroup
      );
    },
    async resumeCampaignGroupSchedule(
      id: string
    ): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/campaign-groups/${enc(id)}/resume-schedule`,
        undefined,
        parseCampaignGroup
      );
    },

    // ── Tag definitions ───────────────────────────────────────────
    async listTags(): Promise<Result<readonly TagDefinitionResponse[], ApiError>> {
      return call("GET", "/api/v1/tag-definitions", undefined, parseTagDefinitionArray);
    },
    async getTagDefinition(slug: string): Promise<Result<TagDefinitionDetailResponse, ApiError>> {
      return call("GET", `/api/v1/tag-definitions/${enc(slug)}`, undefined, parseTagDetail);
    },
    async updateTagDefinition(
      slug: string,
      body: UpdateTagDefinitionRequest
    ): Promise<Result<TagDefinitionDetailResponse, ApiError>> {
      return call("PATCH", `/api/v1/tag-definitions/${enc(slug)}`, body, parseTagDetail);
    },
    async deleteTagDefinition(slug: string): Promise<Result<null, ApiError>> {
      return call("DELETE", `/api/v1/tag-definitions/${enc(slug)}`, undefined, parseEmpty);
    },

    // ── Custom rules ──────────────────────────────────────────────
    async listCustomRules(
      filters: PageFilters
    ): Promise<Result<readonly CustomRuleResponse[], ApiError>> {
      return call(
        "GET",
        `/api/v1/custom-rules?${buildQuery(filters)}`,
        undefined,
        parseCustomRuleArray
      );
    },
    async getCustomRule(id: string): Promise<Result<CustomRuleResponse, ApiError>> {
      return call("GET", `/api/v1/custom-rules/${enc(id)}`, undefined, parseCustomRule);
    },
    async createCustomRule(
      body: CreateCustomRuleRequest
    ): Promise<Result<CustomRuleResponse, ApiError>> {
      return call("POST", "/api/v1/custom-rules", body, parseCustomRule);
    },
    async updateCustomRule(
      id: string,
      body: UpdateCustomRuleRequest
    ): Promise<Result<CustomRuleResponse, ApiError>> {
      return call("PUT", `/api/v1/custom-rules/${enc(id)}`, body, parseCustomRule);
    },
    async deleteCustomRule(id: string): Promise<Result<null, ApiError>> {
      return call("DELETE", `/api/v1/custom-rules/${enc(id)}`, undefined, parseEmpty);
    },
    async testCustomRule(body: RuleTestRequest): Promise<Result<RuleTestResponse, ApiError>> {
      return call("POST", "/api/v1/custom-rules/test", body, parseRuleTest);
    },

    // ── Policy sets ───────────────────────────────────────────────
    async listPolicySets(): Promise<Result<readonly PolicySetResponse[], ApiError>> {
      return call("GET", "/api/v1/policy-sets", undefined, parsePolicySetList);
    },
    async getPolicySet(id: string): Promise<Result<PolicySetResponse, ApiError>> {
      return call("GET", `/api/v1/policy-sets/${enc(id)}`, undefined, parsePolicySet);
    },
    async createPolicySet(
      body: CreatePolicySetRequest
    ): Promise<Result<PolicySetResponse, ApiError>> {
      return call("POST", "/api/v1/policy-sets", body, parsePolicySet);
    },
    async updatePolicySet(
      id: string,
      body: UpdatePolicySetRequest
    ): Promise<Result<PolicySetResponse, ApiError>> {
      return call("PUT", `/api/v1/policy-sets/${enc(id)}`, body, parsePolicySet);
    },
    async deletePolicySet(id: string): Promise<Result<null, ApiError>> {
      return call("DELETE", `/api/v1/policy-sets/${enc(id)}`, undefined, parseEmpty);
    },
    async requestPolicySetApproval(id: string): Promise<Result<PolicySetResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/policy-sets/${enc(id)}/request-approval`,
        undefined,
        parsePolicySet
      );
    },

    // ── Alerts ────────────────────────────────────────────────────
    async listAlerts(
      filters: ListAlertsFilters
    ): Promise<Result<PaginatedResponse<AlertResponse>, ApiError>> {
      return call("GET", `/api/v1/alerts?${buildQuery(filters)}`, undefined, parseAlertPage);
    },
    async updateAlertStatus(
      alertId: string,
      body: UpdateAlertStatusRequest
    ): Promise<Result<null, ApiError>> {
      return call("PATCH", `/api/v1/alerts/${enc(alertId)}/status`, body, parseEmpty);
    },
    async getAlertStats(): Promise<Result<AlertStatsResponse, ApiError>> {
      return call("GET", "/api/v1/alerts/stats", undefined, parseAlertStats);
    },

    // ── Webhooks ──────────────────────────────────────────────────
    async listWebhooks(): Promise<Result<readonly WebhookResponse[], ApiError>> {
      return call("GET", "/api/v1/webhooks", undefined, parseWebhookList);
    },
    async getWebhook(id: string): Promise<Result<WebhookResponse, ApiError>> {
      return call("GET", `/api/v1/webhooks/${enc(id)}`, undefined, parseWebhook);
    },
    async createWebhook(
      body: CreateWebhookRequest
    ): Promise<Result<WebhookCreatedResponse, ApiError>> {
      return call("POST", "/api/v1/webhooks", body, parseWebhookCreated);
    },
    async updateWebhook(
      id: string,
      body: UpdateWebhookRequest
    ): Promise<Result<WebhookResponse, ApiError>> {
      return call("PATCH", `/api/v1/webhooks/${enc(id)}`, body, parseWebhook);
    },
    async deleteWebhook(id: string): Promise<Result<null, ApiError>> {
      return call("DELETE", `/api/v1/webhooks/${enc(id)}`, undefined, parseEmpty);
    },
    async testWebhook(endpointId: string): Promise<Result<null, ApiError>> {
      return call("POST", `/api/v1/webhooks/${enc(endpointId)}/test`, undefined, parseEmpty);
    },
    async rotateWebhookSecret(
      endpointId: string
    ): Promise<Result<WebhookCreatedResponse, ApiError>> {
      return call(
        "POST",
        `/api/v1/webhooks/${enc(endpointId)}/rotate-secret`,
        undefined,
        parseWebhookCreated
      );
    },
    async listWebhookEventTypes(): Promise<Result<EventCatalogResponse, ApiError>> {
      return call("GET", "/api/v1/webhooks/event-types", undefined, parseEventCatalog);
    },
    async listWebhookDeliveries(
      endpointId: string,
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<DeliveryAttemptResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/webhooks/${enc(endpointId)}/deliveries?${buildQuery(filters)}`,
        undefined,
        parsePageOf(parseWebhookDelivery)
      );
    },
    async replayWebhookDelivery(attemptId: string): Promise<Result<null, ApiError>> {
      return call(
        "POST",
        `/api/v1/webhooks/deliveries/${enc(attemptId)}/replay`,
        undefined,
        parseEmpty
      );
    },
    async bulkReplayWebhook(
      endpointId: string,
      body: BulkReplayRequest
    ): Promise<Result<BulkReplayResponse, ApiError>> {
      return call("POST", `/api/v1/webhooks/${enc(endpointId)}/replay`, body, parseBulkReplay);
    },

    // ── Billing ───────────────────────────────────────────────────
    async getBillingSummary(): Promise<Result<BillingSummaryResponse, ApiError>> {
      return call("GET", "/api/v1/billing", undefined, parseBillingSummary);
    },
    async listUsage(
      filters: ListUsageFilters
    ): Promise<Result<PaginatedResponse<UsageResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/billing/usage?${buildQuery(filters)}`,
        undefined,
        parsePageOf(parseUsage)
      );
    },
    async getUsageSummary(): Promise<Result<UsagePeriodSummaryResponse, ApiError>> {
      return call("GET", "/api/v1/billing/usage/summary", undefined, parseUsageSummary);
    },
    async listBalanceHistory(
      filters: ListBalanceHistoryFilters
    ): Promise<Result<PaginatedResponse<BalanceTransactionResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/billing/history?${buildQuery(filters)}`,
        undefined,
        parsePageOf(parseBalanceTx)
      );
    },

    // ── Invoicing ─────────────────────────────────────────────────
    async listInvoices(
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<InvoiceResponse>, ApiError>> {
      return call(
        "GET",
        `/api/v1/invoices?${buildQuery(filters)}`,
        undefined,
        parsePageOf(parseInvoice)
      );
    },

    // ── Alert notifications ───────────────────────────────────────
    async listAlertDestinations(): Promise<
      Result<readonly AlertNotificationDestinationResponse[], ApiError>
    > {
      return call(
        "GET",
        "/api/v1/alert-notifications/destinations",
        undefined,
        parseArrayOf(parseAlertDestination)
      );
    },
    async deleteAlertDestination(id: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        `/api/v1/alert-notifications/destinations/${enc(id)}`,
        undefined,
        parseEmpty
      );
    },
    async setAlertDestinationVersion(
      id: string,
      body: SetDestinationVersionRequest
    ): Promise<Result<AlertNotificationDestinationResponse, ApiError>> {
      return call(
        "PATCH",
        `/api/v1/alert-notifications/destinations/${enc(id)}/version`,
        body,
        parseAlertDestination
      );
    },
    async getCampaignAlertOverrides(
      campaignId: string
    ): Promise<Result<CampaignOverridesResponse, ApiError>> {
      return call(
        "GET",
        `/api/v1/alert-notifications/campaigns/${enc(campaignId)}/overrides`,
        undefined,
        parseCampaignAlertOverrides
      );
    },
    async setCampaignAlertOverrides(
      campaignId: string,
      body: SetCampaignOverridesRequest
    ): Promise<Result<CampaignOverridesResponse, ApiError>> {
      return call(
        "PUT",
        `/api/v1/alert-notifications/campaigns/${enc(campaignId)}/overrides`,
        body,
        parseCampaignAlertOverrides
      );
    },
  };
}

function buildQuery(filters: object): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;
    qs.set(key, String(value));
  }
  return qs.toString();
}
