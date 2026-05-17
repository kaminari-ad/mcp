/**
 * Production {@link ApiGateway} adapter.
 *
 * Backed by `openapi-fetch` over `paths` generated from the API's live
 * OpenAPI spec (see `scripts/gen-api-types.ts`):
 *
 *   - Every endpoint path is a literal type constrained by `paths`.
 *     Renaming or removing an endpoint on the API side fails this
 *     gateway at `tsc --noEmit` immediately, no runtime drift.
 *   - Path / query / body shapes are validated by the same generated
 *     types, with the agent-facing `Pick<S[K], ...>` projections in
 *     `domain/ports/api-gateway.ts` narrowing the surface to the
 *     fields the MCP exposes.
 *   - Response decoding still goes through the typed parsers under
 *     `./parsers/*` (each one a one-liner backed by
 *     `parseWithSchema(schemas.X.pick({...}))`), so a wrong-shape
 *     payload at runtime degrades to a typed `upstream` MCP error
 *     instead of a crash.
 *
 * Tenant-isolation contract: built per-request in HTTP mode, holding
 * exactly ONE caller's Bearer in a private closure plus a fresh
 * `openapi-fetch` client. The factory is never used to build a
 * singleton — each MCP request gets its own gateway, gc'd when the
 * request ends.
 *
 * Network transport: undici. Tests pass a `MockAgent`-backed
 * `Dispatcher`; production uses the default global agent.
 */

import createClient from "openapi-fetch";
import { type Dispatcher, fetch as undiciFetch } from "undici";

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
  CampaignPickerItem,
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
import type { paths } from "../../shared/api/openapi.js";
import { err, type Result } from "../../shared/result.js";
import { toApiError } from "./error-mapping.js";
import { parseAlertPage } from "./parsers/parse-alert.js";
import { parseApiKeyList } from "./parsers/parse-api-key.js";
import { parseBillingSummary } from "./parsers/parse-billing-summary.js";
import { parseCampaign, parseCampaignPage } from "./parsers/parse-campaign.js";
import { parseCampaignGroup, parseCampaignGroupArray } from "./parsers/parse-campaign-group.js";
import { parseCampaignPickerArray } from "./parsers/parse-campaign-picker.js";
import { parseIntField } from "./parsers/parse-count-envelope.js";
import { parseCustomRule } from "./parsers/parse-custom-rule.js";
import { parseCustomRulePage } from "./parsers/parse-custom-rule-page.js";
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
  parseUsage,
  parseUsageSummary,
  parseUser,
  parseWebhookDelivery,
} from "./parsers/parse-generic.js";
import { parseGeoList } from "./parsers/parse-geo-list.js";
import { parsePolicySet } from "./parsers/parse-policy-set.js";
import { parsePolicySetPage } from "./parsers/parse-policy-set-page.js";
import { parseRun } from "./parsers/parse-run.js";
import { parseRunScanPage } from "./parsers/parse-run-scan-page.js";
import { parseScan, parseScanArray } from "./parsers/parse-scan.js";
import { parseScanPage } from "./parsers/parse-scan-page.js";
import { parseTagDefinitionArray, parseTagDetail } from "./parsers/parse-tag.js";
import {
  parseTestWebhookResponse,
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
   * Optional undici dispatcher — tests pass a `MockAgent`; production
   * uses the default global agent.
   */
  readonly dispatcher?: Dispatcher;
}

/**
 * openapi-fetch's `init` argument differs per method (GET vs POST etc.)
 * and per endpoint (which params it accepts). The typed surface is
 * enforced by the per-method literal path passed at the call site:
 * `client.GET("/api/v1/scans/{scan_id}", { params: { path: { scan_id: id } } })`
 * is fully type-checked. Inside the generic `call()` helper we erase
 * `init` to `unknown` because the helper is generic over arbitrary
 * endpoint shapes — the eslint suppression below covers ONLY this
 * internal erasure, not the per-method call sites.
 */
type OpenapiInit = unknown;

/** Build a fresh `ApiGateway` for one logical request scope. */
export function createHttpApiGateway(config: HttpApiGatewayConfig): ApiGateway {
  const { baseUrl, bearer, requestId, logger, dispatcher } = config;

  // Custom fetch — wraps undici.fetch so we can inject the per-request
  // dispatcher (used by tests). In production `dispatcher` is undefined
  // and undici.fetch uses the global agent.
  //
  // openapi-fetch passes a Request object as `input` (with headers,
  // method and body bound to it); we splice those onto init so undici
  // sees the auth header / body. If we passed `input` directly, undici
  // ignores the Request and only reads init — auth headers vanish.
  const fetchImpl: typeof fetch = async (input, init) => {
    // openapi-fetch ALWAYS calls us with a fully-formed `Request`
    // (it constructs one internally even when the consumer never
    // passes one). The `string | URL` branches of the `typeof fetch`
    // signature are dead in this codepath; narrow up-front so the
    // hot path below can assume Request without re-typing every
    // line. The branch IS reachable in isolation tests that hand-call
    // `fetchImpl` to exercise the contract — see the smoke test in
    // tests/unit/infrastructure/api/http-api-gateway.test.ts.
    /* c8 ignore next 5 — defensive narrow, exercised via the typed call path; openapi-fetch never hits it */
    if (typeof input === "string" || input instanceof URL) {
      throw new TypeError(
        "createHttpApiGateway.fetchImpl: openapi-fetch is expected to always pass a Request"
      );
    }

    // undici's RequestInit and the global RequestInit have subtly
    // different `BodyInit` shapes (undici-types vs undici/types).
    // We forward fields as an opaque bag — openapi-fetch already
    // constructed a fully-formed Request, we just rebind it for
    // undici.fetch + the per-request dispatcher.
    const baseInit: Record<string, unknown> = { ...(init ?? {}) };
    baseInit["method"] ??= input.method;
    if (baseInit["headers"] === undefined) {
      const merged: Record<string, string> = {};
      input.headers.forEach((value, key) => {
        merged[key] = value;
      });
      baseInit["headers"] = merged;
    }
    // Request body is a ReadableStream; openapi-fetch has already
    // serialised the JSON body and the Request wraps it. Read it
    // back as text so undici sees a concrete payload — passing the
    // ReadableStream straight through requires `duplex: "half"` AND
    // triggers chunked transfer in some setups (and MockAgent does
    // not understand chunked).
    if (baseInit["body"] === undefined && input.body !== null) {
      baseInit["body"] = await input.text();
      baseInit["duplex"] ??= "half";
    }

    if (dispatcher !== undefined) {
      baseInit["dispatcher"] = dispatcher;
    }

    // undici's Response and the global `Response` share the same
    // primitive shape in Node 18+ (undici backs both). The narrow
    // assertion here is the cross-library boundary.
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    return undiciFetch(
      input.url,
      baseInit as Parameters<typeof undiciFetch>[1]
    ) as unknown as Response;
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  };

  // Pinned outbound header allowlist — must match the 5-key contract
  // documented in `CONTRIBUTING.md` "Tenant isolation" §9. Enforced by
  // `tests/isolation/header-injection-e2e.test.ts` (source-text regex
  // gate) and `tests/isolation/header-injection.test.ts` (behavioural
  // assertion that the same five keys reach the wire).
  const client = createClient<paths>({
    baseUrl,
    fetch: fetchImpl,
    headers: {
      authorization: bearer.toAuthorizationHeader(),
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "kaminari-ad-mcp",
      "x-request-id": requestId,
    },
  });

  type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

  interface OpenapiResult {
    readonly data?: unknown;
    readonly error?: unknown;
    readonly response: Response;
  }

  // Type-erased dispatch table over the openapi-fetch client's typed
  // method surface (`client.GET("/api/v1/...", { params... })`). The
  // per-call-site narrowing through the helper below preserves end-to-
  // end path/body typing — the erasure here is purely so the helper
  // can be generic over method name. The functions are bound to the
  // client to preserve `this`.
  /* eslint-disable @typescript-eslint/consistent-type-assertions */
  const dispatch: Record<HttpMethod, (p: string, i: OpenapiInit) => Promise<OpenapiResult>> = {
    GET: client.GET.bind(client) as (p: string, i: OpenapiInit) => Promise<OpenapiResult>,
    POST: client.POST.bind(client) as (p: string, i: OpenapiInit) => Promise<OpenapiResult>,
    PATCH: client.PATCH.bind(client) as (p: string, i: OpenapiInit) => Promise<OpenapiResult>,
    PUT: client.PUT.bind(client) as (p: string, i: OpenapiInit) => Promise<OpenapiResult>,
    DELETE: client.DELETE.bind(client) as (p: string, i: OpenapiInit) => Promise<OpenapiResult>,
  };
  /* eslint-enable @typescript-eslint/consistent-type-assertions */

  async function call<T>(
    method: HttpMethod,
    path: string,
    init: OpenapiInit,
    parse: (raw: unknown) => Result<T, ApiError>
  ): Promise<Result<T, ApiError>> {
    const startedAtMs = Date.now();
    let result: OpenapiResult;
    try {
      result = await dispatch[method](path, init);
    } catch (cause) {
      logger.warn({ api_path: path, elapsed_ms: Date.now() - startedAtMs }, "api.network_error");
      // undici.fetch wraps the underlying connection error as
      // `TypeError("fetch failed")` with `.cause = the original Error`.
      // The raw message ("ECONNRESET", "ENOTFOUND", "self-signed
      // certificate"…) is the operator-actionable bit — unwrap it.
      const inner =
        cause instanceof Error && cause.cause instanceof Error
          ? cause.cause
          : cause instanceof Error
            ? cause
            : null;
      return err({
        kind: "upstream",
        detail: inner !== null ? inner.message : "network error",
      });
    }

    const { data, error, response } = result;
    const status = response.status;
    logger.info(
      { api_path: path, api_status: status, elapsed_ms: Date.now() - startedAtMs },
      "api.done"
    );

    if (status >= 200 && status < 300) {
      return parse(data === undefined ? null : data);
    }
    return err(toApiError(status, error ?? data, response.headers.get("retry-after") ?? undefined));
  }

  return {
    // ── Account ───────────────────────────────────────────────────
    async getAccount(): Promise<Result<OrgResponse, ApiError>> {
      return call("GET", "/api/v1/account", {}, parseOrg);
    },
    async updateOrg(body: UpdateOrgRequest): Promise<Result<OrgResponse, ApiError>> {
      return call("PATCH", "/api/v1/account", { body }, parseOrg);
    },
    async listOrgUsers(): Promise<Result<readonly UserResponse[], ApiError>> {
      return call("GET", "/api/v1/account/users", {}, parseArrayOf(parseUser));
    },
    async inviteUser(body: InviteUserRequest): Promise<Result<UserResponse, ApiError>> {
      return call("POST", "/api/v1/account/users/invite", { body }, parseUser);
    },
    async updateUserRole(
      userId: string,
      body: UpdateUserRoleRequest
    ): Promise<Result<null, ApiError>> {
      return call(
        "PATCH",
        "/api/v1/account/users/{user_id}/role",
        { params: { path: { user_id: userId } }, body },
        parseEmpty
      );
    },
    async removeUser(userId: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        "/api/v1/account/users/{user_id}",
        { params: { path: { user_id: userId } } },
        parseEmpty
      );
    },
    async transferOwnership(userId: string): Promise<Result<null, ApiError>> {
      return call(
        "POST",
        "/api/v1/account/users/{user_id}/transfer-ownership",
        { params: { path: { user_id: userId } } },
        parseEmpty
      );
    },
    async listOrgRoles(): Promise<Result<readonly RoleResponse[], ApiError>> {
      return call("GET", "/api/v1/account/roles", {}, parseArrayOf(parseRole));
    },
    async listApiKeys(): Promise<Result<readonly ApiKeyResponse[], ApiError>> {
      return call("GET", "/api/v1/account/api-keys", {}, parseApiKeyList);
    },
    async createApiKey(
      body: CreateApiKeyRequest
    ): Promise<Result<ApiKeyCreatedResponse, ApiError>> {
      return call("POST", "/api/v1/account/api-keys", { body }, parseApiKeyCreated);
    },
    async revokeApiKey(keyId: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        "/api/v1/account/api-keys/{key_id}",
        { params: { path: { key_id: keyId } } },
        parseEmpty
      );
    },

    // ── Scans ─────────────────────────────────────────────────────
    async listScans(
      filters: ListScansFilters
    ): Promise<Result<PaginatedResponse<ScanBriefResponse>, ApiError>> {
      return call("GET", "/api/v1/scans", { params: { query: filters } }, parseScanPage);
    },
    async getScan(scanId: string): Promise<Result<ScanResponse, ApiError>> {
      return call(
        "GET",
        "/api/v1/scans/{scan_id}",
        { params: { path: { scan_id: scanId } } },
        parseScan
      );
    },
    async createScan(body: CreateScanRequest): Promise<Result<ScanResponse, ApiError>> {
      return call("POST", "/api/v1/scans", { body }, parseScan);
    },
    async createBulkScans(
      body: BulkScanRequest
    ): Promise<Result<readonly ScanResponse[], ApiError>> {
      return call("POST", "/api/v1/scans/bulk", { body }, parseScanArray);
    },
    async recheckScans(body: RecheckRequest): Promise<Result<RecheckResponse, ApiError>> {
      return call("POST", "/api/v1/scans/recheck", { body }, (raw) =>
        parseIntField(raw, "queued_count")
      );
    },
    async cancelScan(scanId: string): Promise<Result<CancelPendingResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/scans/{scan_id}/cancel",
        { params: { path: { scan_id: scanId } } },
        (raw) => parseIntField(raw, "cancelled_count")
      );
    },
    async listScanTags(scanId: string): Promise<Result<readonly ScanTagResponse[], ApiError>> {
      return call(
        "GET",
        "/api/v1/scans/{scan_id}/tags",
        { params: { path: { scan_id: scanId } } },
        parseArrayOf(parseScanTag)
      );
    },

    // ── Geos / emulators ──────────────────────────────────────────
    async listGeos(): Promise<Result<readonly GeoResponse[], ApiError>> {
      return call("GET", "/api/v1/geos", {}, parseGeoList);
    },
    async listEmulators(): Promise<Result<readonly EmulatorResponse[], ApiError>> {
      return call("GET", "/api/v1/emulators", {}, parseEmulatorList);
    },

    // ── Campaigns ─────────────────────────────────────────────────
    async listCampaigns(
      filters: ListCampaignsFilters
    ): Promise<Result<PaginatedResponse<CampaignResponse>, ApiError>> {
      return call("GET", "/api/v1/campaigns", { params: { query: filters } }, parseCampaignPage);
    },
    async getCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call(
        "GET",
        "/api/v1/campaigns/{campaign_id}",
        { params: { path: { campaign_id: id } } },
        parseCampaign
      );
    },
    async createCampaign(body: CreateCampaignRequest): Promise<Result<CampaignResponse, ApiError>> {
      return call("POST", "/api/v1/campaigns", { body }, parseCampaign);
    },
    async updateCampaign(
      id: string,
      body: UpdateCampaignRequest
    ): Promise<Result<CampaignResponse, ApiError>> {
      return call(
        "PATCH",
        "/api/v1/campaigns/{campaign_id}",
        { params: { path: { campaign_id: id } }, body },
        parseCampaign
      );
    },
    async runCampaign(id: string): Promise<Result<RunResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaigns/{campaign_id}/run",
        { params: { path: { campaign_id: id } } },
        parseRun
      );
    },
    async archiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaigns/{campaign_id}/archive",
        { params: { path: { campaign_id: id } } },
        parseCampaign
      );
    },
    async unarchiveCampaign(id: string): Promise<Result<CampaignResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaigns/{campaign_id}/unarchive",
        { params: { path: { campaign_id: id } } },
        parseCampaign
      );
    },
    async cancelCampaign(id: string): Promise<Result<CancelPendingResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaigns/{campaign_id}/cancel",
        { params: { path: { campaign_id: id } } },
        (raw) => parseIntField(raw, "cancelled_count")
      );
    },
    async listCampaignRuns(
      campaignId: string,
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<RunResponse>, ApiError>> {
      return call(
        "GET",
        "/api/v1/campaigns/{campaign_id}/runs",
        { params: { path: { campaign_id: campaignId }, query: filters } },
        parsePageOf(parseRun)
      );
    },
    async listCampaignsPicker(): Promise<Result<readonly CampaignPickerItem[], ApiError>> {
      return call("GET", "/api/v1/campaigns/picker", {}, parseCampaignPickerArray);
    },

    // ── Runs ──────────────────────────────────────────────────────
    async getRun(id: string): Promise<Result<RunResponse, ApiError>> {
      return call("GET", "/api/v1/runs/{run_id}", { params: { path: { run_id: id } } }, parseRun);
    },
    async cancelRun(id: string): Promise<Result<CancelPendingResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/runs/{run_id}/cancel",
        { params: { path: { run_id: id } } },
        (raw) => parseIntField(raw, "cancelled_count")
      );
    },
    async listRunScans(
      runId: string,
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<ScanTileResponse>, ApiError>> {
      return call(
        "GET",
        "/api/v1/runs/{run_id}/scans",
        { params: { path: { run_id: runId }, query: filters } },
        parseRunScanPage
      );
    },

    // ── Campaign groups ───────────────────────────────────────────
    async listCampaignGroups(filters?: {
      readonly archived?: boolean;
    }): Promise<Result<readonly CampaignGroupResponse[], ApiError>> {
      return call(
        "GET",
        "/api/v1/campaign-groups",
        { params: { query: filters ?? {} } },
        parseCampaignGroupArray
      );
    },
    async getCampaignGroup(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "GET",
        "/api/v1/campaign-groups/{group_id}",
        { params: { path: { group_id: id } } },
        parseCampaignGroup
      );
    },
    async createCampaignGroup(
      body: CreateCampaignGroupRequest
    ): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call("POST", "/api/v1/campaign-groups", { body }, parseCampaignGroup);
    },
    async updateCampaignGroup(
      id: string,
      body: UpdateCampaignGroupRequest
    ): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "PATCH",
        "/api/v1/campaign-groups/{group_id}",
        { params: { path: { group_id: id } }, body },
        parseCampaignGroup
      );
    },
    async runCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaign-groups/{group_id}/run",
        { params: { path: { group_id: id } } },
        parseGroupAction
      );
    },
    async cancelCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaign-groups/{group_id}/cancel",
        { params: { path: { group_id: id } } },
        parseGroupAction
      );
    },
    async archiveCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaign-groups/{group_id}/archive",
        { params: { path: { group_id: id } } },
        parseGroupAction
      );
    },
    async unarchiveCampaignGroup(id: string): Promise<Result<GroupActionResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaign-groups/{group_id}/unarchive",
        { params: { path: { group_id: id } } },
        parseGroupAction
      );
    },
    async pauseCampaignGroupSchedule(id: string): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaign-groups/{group_id}/pause-schedule",
        { params: { path: { group_id: id } } },
        parseCampaignGroup
      );
    },
    async resumeCampaignGroupSchedule(
      id: string
    ): Promise<Result<CampaignGroupResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/campaign-groups/{group_id}/resume-schedule",
        { params: { path: { group_id: id } } },
        parseCampaignGroup
      );
    },

    // ── Tag definitions ───────────────────────────────────────────
    async listTags(): Promise<Result<readonly TagDefinitionResponse[], ApiError>> {
      return call("GET", "/api/v1/tag-definitions", {}, parseTagDefinitionArray);
    },
    async getTagDefinition(slug: string): Promise<Result<TagDefinitionDetailResponse, ApiError>> {
      return call(
        "GET",
        "/api/v1/tag-definitions/{slug}",
        { params: { path: { slug } } },
        parseTagDetail
      );
    },
    async updateTagDefinition(
      slug: string,
      body: UpdateTagDefinitionRequest
    ): Promise<Result<null, ApiError>> {
      return call(
        "PATCH",
        "/api/v1/tag-definitions/{slug}",
        { params: { path: { slug } }, body },
        parseEmpty
      );
    },
    async deleteTagDefinition(slug: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        "/api/v1/tag-definitions/{slug}",
        { params: { path: { slug } } },
        parseEmpty
      );
    },

    // ── Custom rules ──────────────────────────────────────────────
    async listCustomRules(
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<CustomRuleResponse>, ApiError>> {
      return call(
        "GET",
        "/api/v1/custom-rules",
        { params: { query: filters } },
        parseCustomRulePage
      );
    },
    async getCustomRule(id: string): Promise<Result<CustomRuleResponse, ApiError>> {
      return call(
        "GET",
        "/api/v1/custom-rules/{rule_id}",
        { params: { path: { rule_id: id } } },
        parseCustomRule
      );
    },
    async createCustomRule(
      body: CreateCustomRuleRequest
    ): Promise<Result<CustomRuleResponse, ApiError>> {
      return call("POST", "/api/v1/custom-rules", { body }, parseCustomRule);
    },
    async updateCustomRule(
      id: string,
      body: UpdateCustomRuleRequest
    ): Promise<Result<CustomRuleResponse, ApiError>> {
      return call(
        "PUT",
        "/api/v1/custom-rules/{rule_id}",
        { params: { path: { rule_id: id } }, body },
        parseCustomRule
      );
    },
    async deleteCustomRule(id: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        "/api/v1/custom-rules/{rule_id}",
        { params: { path: { rule_id: id } } },
        parseEmpty
      );
    },
    async testCustomRule(body: RuleTestRequest): Promise<Result<RuleTestResponse, ApiError>> {
      return call("POST", "/api/v1/custom-rules/test", { body }, parseRuleTest);
    },

    // ── Policy sets ───────────────────────────────────────────────
    async listPolicySets(
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<PolicySetListItemResponse>, ApiError>> {
      return call("GET", "/api/v1/policy-sets", { params: { query: filters } }, parsePolicySetPage);
    },
    async getPolicySet(id: string): Promise<Result<PolicySetResponse, ApiError>> {
      return call(
        "GET",
        "/api/v1/policy-sets/{policy_set_id}",
        { params: { path: { policy_set_id: id } } },
        parsePolicySet
      );
    },
    async createPolicySet(
      body: CreatePolicySetRequest
    ): Promise<Result<PolicySetResponse, ApiError>> {
      return call("POST", "/api/v1/policy-sets", { body }, parsePolicySet);
    },
    async updatePolicySet(
      id: string,
      body: UpdatePolicySetRequest
    ): Promise<Result<PolicySetResponse, ApiError>> {
      return call(
        "PUT",
        "/api/v1/policy-sets/{policy_set_id}",
        { params: { path: { policy_set_id: id } }, body },
        parsePolicySet
      );
    },
    async deletePolicySet(id: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        "/api/v1/policy-sets/{policy_set_id}",
        { params: { path: { policy_set_id: id } } },
        parseEmpty
      );
    },
    async requestPolicySetApproval(id: string): Promise<Result<null, ApiError>> {
      return call(
        "POST",
        "/api/v1/policy-sets/{policy_set_id}/request-approval",
        { params: { path: { policy_set_id: id } } },
        parseEmpty
      );
    },

    // ── Alerts ────────────────────────────────────────────────────
    async listAlerts(
      filters: ListAlertsFilters
    ): Promise<Result<PaginatedResponse<AlertResponse>, ApiError>> {
      return call("GET", "/api/v1/alerts", { params: { query: filters } }, parseAlertPage);
    },
    async updateAlertStatus(
      alertId: string,
      body: UpdateAlertStatusRequest
    ): Promise<Result<null, ApiError>> {
      return call(
        "PATCH",
        "/api/v1/alerts/{alert_id}/status",
        { params: { path: { alert_id: alertId } }, body },
        parseEmpty
      );
    },
    async getAlertStats(): Promise<Result<AlertStatsResponse, ApiError>> {
      return call("GET", "/api/v1/alerts/stats", {}, parseAlertStats);
    },

    // ── Webhooks ──────────────────────────────────────────────────
    async listWebhooks(): Promise<Result<readonly WebhookResponse[], ApiError>> {
      return call("GET", "/api/v1/webhooks", {}, parseWebhookList);
    },
    async getWebhook(id: string): Promise<Result<WebhookResponse, ApiError>> {
      return call(
        "GET",
        "/api/v1/webhooks/{endpoint_id}",
        { params: { path: { endpoint_id: id } } },
        parseWebhook
      );
    },
    async createWebhook(
      body: CreateWebhookRequest
    ): Promise<Result<WebhookCreatedResponse, ApiError>> {
      return call("POST", "/api/v1/webhooks", { body }, parseWebhookCreated);
    },
    async updateWebhook(
      id: string,
      body: UpdateWebhookRequest
    ): Promise<Result<WebhookResponse, ApiError>> {
      return call(
        "PATCH",
        "/api/v1/webhooks/{endpoint_id}",
        { params: { path: { endpoint_id: id } }, body },
        parseWebhook
      );
    },
    async deleteWebhook(id: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        "/api/v1/webhooks/{endpoint_id}",
        { params: { path: { endpoint_id: id } } },
        parseEmpty
      );
    },
    async testWebhook(
      endpointId: string,
      body: TestWebhookRequest
    ): Promise<Result<TestWebhookResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/webhooks/{endpoint_id}/test",
        { params: { path: { endpoint_id: endpointId } }, body },
        parseTestWebhookResponse
      );
    },
    async rotateWebhookSecret(
      endpointId: string
    ): Promise<Result<WebhookCreatedResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/webhooks/{endpoint_id}/rotate-secret",
        { params: { path: { endpoint_id: endpointId } } },
        parseWebhookCreated
      );
    },
    async listWebhookEventTypes(): Promise<Result<EventCatalogResponse, ApiError>> {
      return call("GET", "/api/v1/webhooks/event-types", {}, parseEventCatalog);
    },
    async listWebhookDeliveries(
      endpointId: string,
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<DeliveryAttemptResponse>, ApiError>> {
      return call(
        "GET",
        "/api/v1/webhooks/{endpoint_id}/deliveries",
        { params: { path: { endpoint_id: endpointId }, query: filters } },
        parsePageOf(parseWebhookDelivery)
      );
    },
    async replayWebhookDelivery(attemptId: string): Promise<Result<null, ApiError>> {
      return call(
        "POST",
        "/api/v1/webhooks/deliveries/{attempt_id}/replay",
        { params: { path: { attempt_id: attemptId } } },
        parseEmpty
      );
    },
    async bulkReplayWebhook(
      endpointId: string,
      body: BulkReplayRequest
    ): Promise<Result<BulkReplayResponse, ApiError>> {
      return call(
        "POST",
        "/api/v1/webhooks/{endpoint_id}/replay",
        { params: { path: { endpoint_id: endpointId } }, body },
        parseBulkReplay
      );
    },

    // ── Billing ───────────────────────────────────────────────────
    async getBillingSummary(): Promise<Result<BillingSummaryResponse, ApiError>> {
      return call("GET", "/api/v1/billing", {}, parseBillingSummary);
    },
    async listUsage(
      filters: ListUsageFilters
    ): Promise<Result<PaginatedResponse<UsageResponse>, ApiError>> {
      return call(
        "GET",
        "/api/v1/billing/usage",
        { params: { query: filters } },
        parsePageOf(parseUsage)
      );
    },
    async getUsageSummary(): Promise<Result<UsagePeriodSummaryResponse, ApiError>> {
      return call("GET", "/api/v1/billing/usage/summary", {}, parseUsageSummary);
    },
    async listBalanceHistory(
      filters: ListBalanceHistoryFilters
    ): Promise<Result<PaginatedResponse<BalanceTransactionResponse>, ApiError>> {
      return call(
        "GET",
        "/api/v1/billing/history",
        { params: { query: filters } },
        parsePageOf(parseBalanceTx)
      );
    },

    // ── Invoicing ─────────────────────────────────────────────────
    async listInvoices(
      filters: PageFilters
    ): Promise<Result<PaginatedResponse<InvoiceResponse>, ApiError>> {
      return call(
        "GET",
        "/api/v1/invoices",
        { params: { query: filters } },
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
        {},
        parseArrayOf(parseAlertDestination)
      );
    },
    async deleteAlertDestination(id: string): Promise<Result<null, ApiError>> {
      return call(
        "DELETE",
        "/api/v1/alert-notifications/destinations/{destination_id}",
        { params: { path: { destination_id: id } } },
        parseEmpty
      );
    },
    async setAlertDestinationVersion(
      id: string,
      body: SetDestinationVersionRequest
    ): Promise<Result<null, ApiError>> {
      // API returns 204 No Content. Use `listAlertDestinations` for
      // the new state if you need it.
      return call(
        "PATCH",
        "/api/v1/alert-notifications/destinations/{destination_id}/version",
        { params: { path: { destination_id: id } }, body },
        parseEmpty
      );
    },
    async getCampaignAlertOverrides(
      campaignId: string
    ): Promise<Result<CampaignOverridesResponse, ApiError>> {
      return call(
        "GET",
        "/api/v1/alert-notifications/campaigns/{campaign_id}/overrides",
        { params: { path: { campaign_id: campaignId } } },
        parseCampaignAlertOverrides
      );
    },
    async setCampaignAlertOverrides(
      campaignId: string,
      body: SetCampaignOverridesRequest
    ): Promise<Result<null, ApiError>> {
      return call(
        "PUT",
        "/api/v1/alert-notifications/campaigns/{campaign_id}/overrides",
        { params: { path: { campaign_id: campaignId } }, body },
        parseEmpty
      );
    },
  };
}
