/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source : https://app.kaminari.ad/openapi.json (regen via `npm run gen:api-types`).
 * Tool   : openapi-zod-client
 *
 * Exposes runtime zod schemas for every `#/components/schemas/X`
 * plus a Zodios `endpoints` definition for every `/api/v1` route.
 * The MCP HTTP gateway uses `schemas.X.safeParse(raw)` at the
 * response boundary so a future API drift surfaces as a typed
 * `upstream` MCP error (with the zod issue message), not as a
 * runtime `undefined.id` crash.
 *
 * CI drift-checks this file the same way it drift-checks openapi.ts.
 */

/* eslint-disable */

import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type SubRequestResponse = {
  url: string;
  resource_type: string;
  status_code: number;
  content_type: string;
  body_size: number;
  timestamp_ms: number;
  children?: Array<SubRequestResponse> | undefined;
};

const OrgResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    owner_id: z.string().uuid(),
    is_active: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const UpdateOrgRequest = z
  .object({ name: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const ValidationError = z
  .object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
    input: z.unknown().optional(),
    ctx: z.object({}).partial().passthrough().optional(),
  })
  .passthrough();
const HTTPValidationError = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();
const LabelDefinitionResponse = z
  .object({
    key: z.string(),
    display_name: z.string(),
    position: z.number().int(),
    auto_extract: z.boolean(),
  })
  .passthrough();
const LabelDefinitionItem = z
  .object({
    key: z.string().max(50),
    display_name: z.string().max(100),
    auto_extract: z.boolean().optional().default(false),
  })
  .passthrough();
const UpdateLabelDefinitionsRequest = z
  .object({ labels: z.array(LabelDefinitionItem) })
  .passthrough();
const UserResponse = z
  .object({
    id: z.string().uuid(),
    email: z.string(),
    name: z.string(),
    role_name: z.string(),
    is_active: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const InviteUserRequest = z.object({
  email: z.string().max(254),
  name: z.string().max(200).optional().default(""),
  role_id: z.string().uuid(),
  timezone: z.union([z.string(), z.null()]).optional(),
});
const UpdateUserRoleRequest = z.object({ role_id: z.string().uuid() }).passthrough();
const ApiKeyResponse = z
  .object({
    id: z.string().uuid(),
    key_prefix: z.string(),
    name: z.string(),
    expires_at: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const CreateApiKeyRequest = z
  .object({
    name: z.string(),
    expires_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ApiKeyCreatedResponse = z
  .object({
    id: z.string().uuid(),
    key_prefix: z.string(),
    full_key: z.string(),
    name: z.string(),
    expires_at: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const RoleResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    scope: z.string(),
    is_system: z.boolean(),
    permissions: z.array(z.string()),
  })
  .passthrough();
const CreateCustomRoleRequest = z
  .object({ name: z.string(), permissions: z.array(z.string()) })
  .passthrough();
const ProxyTargetRequest = z
  .object({
    proxy_type: z.string().default("residential"),
    region: z.string().default(""),
    city: z.string().default(""),
    isp: z.string().default(""),
  })
  .partial()
  .passthrough();
const CreateScanRequest = z
  .object({
    url: z.union([z.string(), z.null()]).optional(),
    ad_tag: z.union([z.string(), z.null()]).optional(),
    country_code: z.string().min(2).max(2),
    emulator_id: z.string().min(1).max(100),
    proxy: ProxyTargetRequest.optional(),
    labels: z.record(z.string()).optional(),
    campaign_id: z.union([z.string(), z.null()]).optional(),
    run_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ScanStatus = z.enum([
  "pending",
  "running",
  "crawled",
  "checking",
  "checking_async",
  "completed",
  "partial",
  "failed",
  "cancelled",
]);
const SubRequestResponse: z.ZodType<SubRequestResponse> = z.lazy(() =>
  z
    .object({
      url: z.string(),
      resource_type: z.string(),
      status_code: z.number().int(),
      content_type: z.string(),
      body_size: z.number().int(),
      timestamp_ms: z.number().int(),
      children: z.array(SubRequestResponse).optional(),
    })
    .passthrough()
);
const RedirectHopResponse = z
  .object({
    url: z.string(),
    status_code: z.number().int(),
    content_type: z.string(),
    body_size: z.number().int(),
    timestamp_ms: z.number().int(),
    redirected_from: z.string(),
    sub_requests: z.array(SubRequestResponse),
  })
  .passthrough();
const ProxyTargetResponse = z
  .object({
    proxy_type: z.string(),
    region: z.string().optional().default(""),
    city: z.string().optional().default(""),
    isp: z.string().optional().default(""),
  })
  .passthrough();
const IabCategoryResponse = z
  .object({
    tier1: z.string(),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ScanClassificationResponse = z
  .object({
    brand: z.union([z.string(), z.null()]),
    iab_v2: z.union([IabCategoryResponse, z.null()]),
    iab_v3: z.union([IabCategoryResponse, z.null()]),
  })
  .partial()
  .passthrough();
const LandingResponse = z
  .object({
    ord: z.number().int(),
    opener_url: z.string().optional().default(""),
    final_url: z.string().optional().default(""),
    offer_url: z.string().optional().default(""),
    page_title: z.string().optional().default(""),
    screenshot_url: z.string().optional().default(""),
    redirect_chain: z.array(RedirectHopResponse).optional(),
    elapsed_ms: z.number().int().optional().default(0),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ScanResponse = z
  .object({
    id: z.string().uuid(),
    url: z.string(),
    country_code: z.string(),
    emulator_id: z.string(),
    status: ScanStatus,
    offer_url: z.string(),
    redirect_chain: z.array(RedirectHopResponse),
    screenshot_url: z.string().optional().default(""),
    ad_tag: z.union([z.string(), z.null()]).optional(),
    creative_screenshot_url: z.string().optional().default(""),
    creative_width: z.number().int().optional().default(0),
    creative_height: z.number().int().optional().default(0),
    proxy: z.union([ProxyTargetResponse, z.null()]).optional(),
    page_title: z.string(),
    elapsed_ms: z.number().int(),
    error: z.string(),
    labels: z.record(z.string()).optional(),
    classification: z.union([ScanClassificationResponse, z.null()]).optional(),
    campaign_id: z.union([z.string(), z.null()]).optional(),
    campaign_name: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    completed_at: z.union([z.string(), z.null()]),
    landings: z.array(LandingResponse).optional(),
  })
  .passthrough();
const status = z.union([z.string(), z.null()]).optional();
const ScanBriefResponse = z
  .object({
    id: z.string().uuid(),
    url: z.string(),
    country_code: z.string(),
    proxy_type: z.string().optional().default("residential"),
    status: ScanStatus,
    offer_url: z.string(),
    screenshot_url: z.string().optional().default(""),
    labels: z.record(z.string()).optional(),
    classification: z.union([ScanClassificationResponse, z.null()]).optional(),
    elapsed_ms: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    campaign_id: z.union([z.string(), z.null()]).optional(),
    campaign_name: z.union([z.string(), z.null()]).optional(),
    is_ad_tag: z.boolean().optional().default(false),
  })
  .passthrough();
const PaginatedResponse_ScanBriefResponse_ = z
  .object({
    items: z.array(ScanBriefResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const BulkScanRequest = z
  .object({
    url: z.union([z.string(), z.null()]).optional(),
    ad_tag: z.union([z.string(), z.null()]).optional(),
    country_codes: z.array(z.string()).min(1),
    emulator_id: z.string().min(1).max(100),
    proxy: ProxyTargetRequest.optional(),
    labels: z.record(z.string()).optional(),
  })
  .passthrough();
const RecheckRequest = z
  .object({
    scope_type: z.enum(["last_n", "hours"]),
    scope_value: z.number().int().gt(0),
  })
  .passthrough();
const RecheckResponse = z.object({ queued_count: z.number().int() }).passthrough();
const CancelPendingResponse = z.object({ cancelled_count: z.number().int() }).passthrough();
const w = z.union([z.number(), z.null()]).optional();
const GeoResponse = z
  .object({
    country_code: z.string(),
    name: z.string(),
    region: z.string(),
    tier: z.string(),
  })
  .passthrough();
const EmulatorResponse = z
  .object({
    id: z.string(),
    display_name: z.string(),
    category: z.string(),
    browser: z.string(),
  })
  .passthrough();
const CreateCampaignGroupRequest = z.object({ name: z.string().min(1).max(200) }).passthrough();
const CampaignGroupResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    is_default: z.boolean(),
    is_archived: z.boolean(),
    schedule_paused: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
    campaign_count: z.union([z.number(), z.null()]).optional(),
  })
  .passthrough();
const UpdateCampaignGroupRequest = z
  .object({ name: z.union([z.string(), z.null()]) })
  .partial()
  .passthrough();
const BulkCampaignFailure = z
  .object({
    campaign_id: z.string().uuid(),
    error_code: z.string(),
    detail: z.string(),
  })
  .passthrough();
const GroupActionResponse = z
  .object({
    group_id: z.string().uuid(),
    affected_campaigns: z.number().int(),
    cancelled_count: z.number().int().optional().default(0),
    run_ids: z.array(z.string().uuid()).optional(),
    failures: z.array(BulkCampaignFailure).optional(),
  })
  .passthrough();
const CreateCampaignRequest = z
  .object({
    name: z.string().min(1).max(200),
    campaign_type: z.string().optional().default("url"),
    url: z.union([z.string(), z.null()]).optional(),
    ad_tag: z.union([z.string(), z.null()]).optional(),
    country_codes: z.array(z.string()).min(1),
    group_id: z.union([z.string(), z.null()]).optional(),
    emulator_categories: z.array(z.string()).optional(),
    emulator_specific_ids: z.array(z.string()).optional(),
    emulator_mode: z.string().optional().default("random"),
    proxy_type: z.string().optional().default("residential"),
    proxy_region: z.string().optional().default(""),
    proxy_city: z.string().optional().default(""),
    proxy_isp: z.string().optional().default(""),
    labels: z.record(z.string()).optional(),
    policy_set_id: z.union([z.string(), z.null()]).optional(),
    schedule_type: z.union([z.string(), z.null()]).optional(),
    schedule_weekly: z.union([z.record(z.array(z.number().int())), z.null()]).optional(),
    schedule_interval_seconds: z.union([z.number(), z.null()]).optional(),
    schedule_enabled: z.union([z.boolean(), z.null()]).optional(),
    schedule_timezone: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const EmulatorSelectionResponse = z
  .object({
    categories: z.array(z.string()),
    specific_ids: z.array(z.string()),
    mode: z.string(),
  })
  .passthrough();
const CampaignResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    campaign_type: z.string().optional().default("url"),
    url: z.string(),
    ad_tag: z.union([z.string(), z.null()]).optional(),
    country_codes: z.array(z.string()),
    group_id: z.string().uuid(),
    emulator_selection: EmulatorSelectionResponse,
    proxy_type: z.string().optional().default("residential"),
    proxy_region: z.string().optional().default(""),
    proxy_city: z.string().optional().default(""),
    proxy_isp: z.string().optional().default(""),
    schedule_type: z.union([z.string(), z.null()]).optional(),
    schedule_weekly: z.union([z.record(z.array(z.number().int())), z.null()]).optional(),
    schedule_interval_seconds: z.union([z.number(), z.null()]).optional(),
    schedule_timezone: z.union([z.string(), z.null()]).optional(),
    labels: z.record(z.string()).optional(),
    policy_set_id: z.union([z.string(), z.null()]).optional(),
    schedule_enabled: z.boolean(),
    is_archived: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
    last_run_at: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PaginatedResponse_CampaignResponse_ = z
  .object({
    items: z.array(CampaignResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const CampaignPickerItem = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    group_id: z.string().uuid(),
    is_archived: z.boolean(),
  })
  .passthrough();
const UpdateCampaignRequest = z
  .object({
    name: z.union([z.string(), z.null()]),
    url: z.union([z.string(), z.null()]),
    ad_tag: z.union([z.string(), z.null()]),
    country_codes: z.union([z.array(z.string()), z.null()]),
    group_id: z.union([z.string(), z.null()]),
    emulator_categories: z.union([z.array(z.string()), z.null()]),
    emulator_specific_ids: z.union([z.array(z.string()), z.null()]),
    emulator_mode: z.union([z.string(), z.null()]),
    proxy_type: z.union([z.string(), z.null()]),
    proxy_region: z.union([z.string(), z.null()]),
    proxy_city: z.union([z.string(), z.null()]),
    proxy_isp: z.union([z.string(), z.null()]),
    labels: z.union([z.record(z.string()), z.null()]),
    policy_set_id: z.union([z.string(), z.null()]),
    schedule_type: z.union([z.string(), z.null()]),
    schedule_weekly: z.union([z.record(z.array(z.number().int())), z.null()]),
    schedule_interval_seconds: z.union([z.number(), z.null()]),
    schedule_enabled: z.union([z.boolean(), z.null()]),
    schedule_timezone: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const RunSource = z.enum(["ui", "api"]);
const RunResponse = z
  .object({
    id: z.string().uuid(),
    campaign_id: z.string().uuid(),
    label: z.string(),
    total: z.number().int(),
    completed: z.number().int(),
    failed: z.number().int(),
    partial: z.number().int(),
    cancelled: z.number().int(),
    source: RunSource,
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedResponse_RunResponse_ = z
  .object({
    items: z.array(RunResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const ScanTileResponse = z
  .object({
    id: z.string().uuid(),
    country_code: z.string(),
    status: z.string(),
    offer_url: z.string().optional().default(""),
    screenshot_url: z.string().optional().default(""),
    elapsed_ms: z.number().int().optional().default(0),
    error: z.string().optional().default(""),
  })
  .passthrough();
const PaginatedResponse_ScanTileResponse_ = z
  .object({
    items: z.array(ScanTileResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const ScanTagResponse = z
  .object({
    id: z.string().uuid(),
    scan_id: z.string().uuid(),
    tag_slug: z.string(),
    detail: z.string(),
    url: z.string().optional().default(""),
    display_name: z.string().optional().default(""),
    category: z.string().optional().default(""),
    severity: z.string().optional().default(""),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const TagDefinitionWithStatsResponse = z
  .object({
    slug: z.string(),
    category: z.string(),
    source: z.string(),
    display_name: z.string(),
    description: z.string(),
    is_system: z.boolean(),
    organization_id: z.union([z.string(), z.null()]),
    show_in_public_report: z.boolean(),
    severity: z.string(),
    scans_count: z.number().int(),
    rules_count: z.number().int(),
  })
  .passthrough();
const LinkedRuleResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    rule_type: z.string(),
    target: z.string(),
    is_active: z.boolean(),
  })
  .passthrough();
const TagDefinitionDetailResponse = z
  .object({
    slug: z.string(),
    category: z.string(),
    source: z.string(),
    display_name: z.string(),
    description: z.string(),
    is_system: z.boolean(),
    organization_id: z.union([z.string(), z.null()]),
    show_in_public_report: z.boolean(),
    severity: z.string(),
    scans_count: z.number().int(),
    rules_count: z.number().int(),
    linked_rules: z.array(LinkedRuleResponse).optional(),
  })
  .passthrough();
const TagSeverity = z.enum(["high", "medium", "low"]);
const UpdateTagDefinitionRequest = z
  .object({
    display_name: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    show_in_public_report: z.union([z.boolean(), z.null()]),
    severity: z.union([TagSeverity, z.null()]),
  })
  .partial()
  .passthrough();
const CreateCustomRuleRequest = z
  .object({
    name: z.string().min(1).max(200),
    tag_slug: z.string().max(100).optional().default(""),
    rule_type: z.string().max(50),
    config: z.object({}).partial().passthrough(),
    target: z.string().max(30).optional().default("page"),
  })
  .passthrough();
const CustomRuleResponse = z
  .object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    name: z.string(),
    tag_slug: z.string(),
    rule_type: z.string(),
    config: z.object({}).partial().passthrough(),
    target: z.string(),
    is_active: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedResponse_CustomRuleResponse_ = z
  .object({
    items: z.array(CustomRuleResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const UpdateCustomRuleRequest = z
  .object({
    name: z.union([z.string(), z.null()]),
    tag_slug: z.union([z.string(), z.null()]),
    config: z.union([z.object({}).partial().passthrough(), z.null()]),
    target: z.union([z.string(), z.null()]),
    is_active: z.union([z.boolean(), z.null()]),
  })
  .partial()
  .passthrough();
const RuleTestRequest = z
  .object({
    scan_id: z.string().uuid(),
    rule_type: z.string(),
    config: z.object({}).partial().passthrough(),
    target: z.string().optional().default("page"),
  })
  .passthrough();
const RuleTestTagResult = z
  .object({ tag_slug: z.string(), detail: z.string().optional().default("") })
  .passthrough();
const RuleTestResponse = z
  .object({
    matched: z.boolean(),
    tags: z.array(RuleTestTagResult),
    elapsed_ms: z.number().int(),
    llm_failed: z.boolean().optional().default(false),
    llm_call_id: z.union([z.string(), z.null()]).optional(),
    llm_prompt_url: z.string().optional().default(""),
    llm_response_url: z.string().optional().default(""),
  })
  .passthrough();
const PolicyEntryRequest = z
  .object({
    tag_slug: z.string().min(1).max(100),
    country_codes: z.array(z.string()).max(50).optional(),
  })
  .passthrough();
const CreatePolicySetRequest = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional().default(""),
    entries: z.array(PolicyEntryRequest).min(1).max(500),
  })
  .passthrough();
const PolicyEntryResponse = z
  .object({
    id: z.string().uuid(),
    tag_slug: z.string(),
    country_codes: z.array(z.string()),
  })
  .passthrough();
const PolicySetResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    organization_id: z.string().uuid(),
    visibility: z.string(),
    is_approved: z.boolean(),
    entries: z.array(PolicyEntryResponse),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const VisibilityType = z.enum(["private", "public"]);
const visibility = z.union([VisibilityType, z.null()]).optional();
const PolicySetListItem = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    organization_id: z.string().uuid(),
    visibility: z.string(),
    is_approved: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedResponse_PolicySetListItem_ = z
  .object({
    items: z.array(PolicySetListItem),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const UpdatePolicySetRequest = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional().default(""),
    entries: z.array(PolicyEntryRequest).min(1).max(500),
  })
  .passthrough();
const AlertStatus = z.enum(["open", "acknowledged", "resolved", "dismissed"]);
const status__2 = z.union([AlertStatus, z.null()]).optional();
const AlertResponse = z
  .object({
    id: z.string().uuid(),
    scan_id: z.string().uuid(),
    campaign_id: z.string().uuid(),
    policy_set_id: z.union([z.string(), z.null()]),
    violation_rule_id: z.union([z.string(), z.null()]),
    organization_id: z.string().uuid(),
    tag_slug: z.string(),
    country_code: z.string(),
    status: z.string(),
    closed_by: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.union([z.string(), z.null()]),
    scan_url: z.string(),
    offer_url: z.string(),
    tag_display_name: z.string(),
  })
  .passthrough();
const PaginatedResponse_AlertResponse_ = z
  .object({
    items: z.array(AlertResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const UpdateAlertStatusRequest = z.object({ status: AlertStatus }).passthrough();
const AlertStatsResponse = z
  .object({
    open: z.number().int(),
    acknowledged: z.number().int(),
    resolved: z.number().int(),
    dismissed: z.number().int(),
  })
  .passthrough();
const BlockReason = z.enum(["no_subscription", "suspended", "insufficient_funds"]);
const BillingSummaryResponse = z
  .object({
    balance_micros: z.number().int(),
    plan_name: z.union([z.string(), z.null()]),
    plan_id: z.union([z.string(), z.null()]),
    checks_per_period: z.union([z.number(), z.null()]),
    checks_used: z.union([z.number(), z.null()]),
    period_start: z.union([z.string(), z.null()]),
    period_end: z.union([z.string(), z.null()]),
    price_per_extra_check_micros: z.union([z.number(), z.null()]),
    current_plan_is_custom: z.boolean().optional().default(false),
    is_suspended: z.boolean().optional().default(false),
    scheduled_next_plan_id: z.union([z.string(), z.null()]).optional(),
    scheduled_next_plan_name: z.union([z.string(), z.null()]).optional(),
    scheduled_effective_at: z.union([z.string(), z.null()]).optional(),
    can_create_scan: z.boolean().optional().default(true),
    block_reason: z.union([BlockReason, z.null()]).optional(),
    billing_mode: z.string().optional().default("prepaid"),
    credit_limit_micros: z.number().int().optional().default(0),
    effective_minimum_balance_micros: z.number().int().optional().default(0),
  })
  .passthrough();
const UsageResponse = z
  .object({
    id: z.string().uuid(),
    scan_id: z.string().uuid(),
    charged_micros: z.number().int(),
    balance_after_micros: z.number().int(),
    within_plan: z.boolean(),
    event_type: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedResponse_UsageResponse_ = z
  .object({
    items: z.array(UsageResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const UsagePeriodSummaryResponse = z
  .object({
    period_start: z.string().datetime({ offset: true }),
    period_end: z.string().datetime({ offset: true }),
    checks: z.number().int(),
    rechecks: z.number().int(),
    within_plan: z.number().int(),
    overage: z.number().int(),
    charged_micros: z.number().int(),
  })
  .passthrough();
const BalanceTransactionType = z.enum([
  "initial_balance",
  "top_up_manual",
  "usage_charge",
  "subscription_renewal",
  "subscription_upgrade",
  "admin_adjustment",
  "refund",
  "invoice_settlement",
  "crypto_top_up",
]);
const type = z.union([z.array(BalanceTransactionType), z.null()]).optional();
const BalanceTransactionResponse = z
  .object({
    id: z.string().uuid(),
    type: z.string(),
    amount_micros: z.number().int(),
    balance_after_micros: z.number().int(),
    description: z.string(),
    reference_kind: z.union([z.string(), z.null()]),
    reference_id: z.union([z.string(), z.null()]),
    actor_user_id: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedResponse_BalanceTransactionResponse_ = z
  .object({
    items: z.array(BalanceTransactionResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const EndpointHealthResponse = z
  .object({
    consecutive_failures: z.number().int(),
    last_delivery_at: z.union([z.string(), z.null()]),
    last_delivery_status: z.union([z.number(), z.null()]),
    success_rate_7d: z.number(),
  })
  .passthrough();
const WebhookResponse = z
  .object({
    id: z.string().uuid(),
    url: z.string(),
    description: z.string(),
    event_types: z.array(z.string()),
    campaign_ids: z.union([z.array(z.string().uuid()), z.null()]),
    is_active: z.boolean(),
    disabled_reason: z.union([z.string(), z.null()]),
    disabled_reason_detail: z.union([z.string(), z.null()]),
    disabled_at: z.union([z.string(), z.null()]),
    health: EndpointHealthResponse,
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const CreateWebhookRequest = z
  .object({
    url: z.string().min(1).max(2048),
    description: z.string().max(256).optional().default(""),
    event_types: z.array(z.string()).optional(),
    campaign_ids: z.union([z.array(z.string().uuid()), z.null()]).optional(),
  })
  .passthrough();
const WebhookCreatedResponse = z
  .object({ webhook: WebhookResponse, secret: z.string() })
  .passthrough();
const EventCatalogEntryResponse = z
  .object({
    event_type: z.string(),
    description: z.string(),
    sample_payload: z.object({}).partial().passthrough(),
  })
  .passthrough();
const EventCatalogResponse = z
  .object({ entries: z.array(EventCatalogEntryResponse) })
  .passthrough();
const UpdateWebhookRequest = z
  .object({
    url: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    event_types: z.union([z.array(z.string()), z.null()]),
    campaign_ids: z.union([z.array(z.string().uuid()), z.null()]),
    clear_campaign_ids: z.boolean().default(false),
    is_active: z.union([z.boolean(), z.null()]),
  })
  .partial()
  .passthrough();
const TestWebhookRequest = z.object({ event_type: z.string() }).passthrough();
const TestWebhookResponse = z
  .object({
    success: z.boolean(),
    response_status: z.union([z.number(), z.null()]),
    elapsed_ms: z.number().int(),
    error_code: z.union([z.string(), z.null()]),
    response_body: z.string(),
  })
  .passthrough();
const success = z.union([z.boolean(), z.null()]).optional();
const DeliveryAttemptResponse = z
  .object({
    id: z.string().uuid(),
    event_id: z.string().uuid(),
    event_type: z.string(),
    response_status: z.union([z.number(), z.null()]),
    response_body: z.union([z.string(), z.null()]),
    success: z.boolean(),
    attempt_number: z.number().int(),
    error_code: z.union([z.string(), z.null()]),
    elapsed_ms: z.union([z.number(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedResponse_DeliveryAttemptResponse_ = z
  .object({
    items: z.array(DeliveryAttemptResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const BulkReplayRequest = z
  .object({
    from_ts: z.string().datetime({ offset: true }),
    to_ts: z.string().datetime({ offset: true }),
  })
  .passthrough();
const BulkReplayResponse = z
  .object({ replayed: z.number().int(), skipped: z.number().int() })
  .passthrough();
const AlertNotificationVersion = z.enum(["public", "internal"]);
const AlertNotificationDestinationResponse = z
  .object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    channel: z.string(),
    name: z.string(),
    is_active: z.boolean(),
    is_default_target: z.boolean(),
    version: AlertNotificationVersion,
    consecutive_failures: z.number().int(),
    last_delivery_at: z.union([z.string(), z.null()]),
    last_delivery_status: z.union([z.number(), z.null()]),
    slack_workspace_id: z.union([z.string(), z.null()]),
    slack_channel_id: z.union([z.string(), z.null()]),
    slack_channel_name: z.union([z.string(), z.null()]),
    telegram_chat_id: z.union([z.number(), z.null()]),
    telegram_chat_title: z.union([z.string(), z.null()]),
    telegram_chat_type: z.union([z.string(), z.null()]),
    email_address: z.union([z.string(), z.null()]),
    included_label_keys: z.array(z.string()),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const SetDestinationVersionRequest = z.object({ version: AlertNotificationVersion }).passthrough();
const CampaignOverridesResponse = z
  .object({
    campaign_id: z.string().uuid(),
    mode: z.string(),
    destination_ids: z.array(z.string().uuid()),
  })
  .passthrough();
const SetCampaignOverridesRequest = z
  .object({
    mode: z.string().min(1).max(16),
    destination_ids: z.array(z.string().uuid()).optional().default([]),
  })
  .passthrough();
const InvoiceType = z.enum(["proforma", "final"]);
const type__2 = z.union([InvoiceType, z.null()]).optional();
const InvoiceStatus = z.enum(["draft", "issued", "paid", "voided", "overdue"]);
const status__3 = z.union([InvoiceStatus, z.null()]).optional();
const InvoiceResponse = z
  .object({
    id: z.string().uuid(),
    number: z.string(),
    organization_id: z.string().uuid(),
    type: z.string(),
    status: z.string(),
    total_micros: z.number().int(),
    currency: z.string(),
    period_start: z.union([z.string(), z.null()]),
    period_end: z.union([z.string(), z.null()]),
    issued_at: z.union([z.string(), z.null()]),
    paid_at: z.union([z.string(), z.null()]),
    voided_at: z.union([z.string(), z.null()]),
    has_pdf: z.boolean(),
    description: z.string(),
    payment_method: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PaginatedResponse_InvoiceResponse_ = z
  .object({
    items: z.array(InvoiceResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const InvoicePdfUrlResponse = z
  .object({ url: z.union([z.string(), z.null()]), ready: z.boolean() })
  .passthrough();
const SubmitContactInquiryRequest = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    message: z.string().min(10).max(2000),
    source: z.string().max(512).optional().default(""),
  })
  .passthrough();
const ContactInquiryAcknowledgement = z
  .object({
    id: z.string().uuid(),
    received_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const PreferredContactChannel = z.enum(["telegram", "whatsapp", "email"]);
const SubmitDemoInquiryRequest = z
  .object({
    first_name: z.string().min(2).max(60),
    last_name: z.string().min(2).max(60),
    company_email: z.string().email(),
    company_name: z.string().min(2).max(120),
    preferred_channel: PreferredContactChannel,
    contact_handle: z.string().max(120).optional().default(""),
    comment: z.string().max(2000).optional().default(""),
    privacy_accepted: z.boolean(),
    source: z.string().max(512).optional().default(""),
  })
  .passthrough();
const DemoInquiryAcknowledgement = z
  .object({
    id: z.string().uuid(),
    received_at: z.string().datetime({ offset: true }),
  })
  .passthrough();

export const schemas = {
  OrgResponse,
  UpdateOrgRequest,
  ValidationError,
  HTTPValidationError,
  LabelDefinitionResponse,
  LabelDefinitionItem,
  UpdateLabelDefinitionsRequest,
  UserResponse,
  InviteUserRequest,
  UpdateUserRoleRequest,
  ApiKeyResponse,
  CreateApiKeyRequest,
  ApiKeyCreatedResponse,
  RoleResponse,
  CreateCustomRoleRequest,
  ProxyTargetRequest,
  CreateScanRequest,
  ScanStatus,
  SubRequestResponse,
  RedirectHopResponse,
  ProxyTargetResponse,
  IabCategoryResponse,
  ScanClassificationResponse,
  LandingResponse,
  ScanResponse,
  status,
  ScanBriefResponse,
  PaginatedResponse_ScanBriefResponse_,
  BulkScanRequest,
  RecheckRequest,
  RecheckResponse,
  CancelPendingResponse,
  w,
  GeoResponse,
  EmulatorResponse,
  CreateCampaignGroupRequest,
  CampaignGroupResponse,
  UpdateCampaignGroupRequest,
  BulkCampaignFailure,
  GroupActionResponse,
  CreateCampaignRequest,
  EmulatorSelectionResponse,
  CampaignResponse,
  PaginatedResponse_CampaignResponse_,
  CampaignPickerItem,
  UpdateCampaignRequest,
  RunSource,
  RunResponse,
  PaginatedResponse_RunResponse_,
  ScanTileResponse,
  PaginatedResponse_ScanTileResponse_,
  ScanTagResponse,
  TagDefinitionWithStatsResponse,
  LinkedRuleResponse,
  TagDefinitionDetailResponse,
  TagSeverity,
  UpdateTagDefinitionRequest,
  CreateCustomRuleRequest,
  CustomRuleResponse,
  PaginatedResponse_CustomRuleResponse_,
  UpdateCustomRuleRequest,
  RuleTestRequest,
  RuleTestTagResult,
  RuleTestResponse,
  PolicyEntryRequest,
  CreatePolicySetRequest,
  PolicyEntryResponse,
  PolicySetResponse,
  VisibilityType,
  visibility,
  PolicySetListItem,
  PaginatedResponse_PolicySetListItem_,
  UpdatePolicySetRequest,
  AlertStatus,
  status__2,
  AlertResponse,
  PaginatedResponse_AlertResponse_,
  UpdateAlertStatusRequest,
  AlertStatsResponse,
  BlockReason,
  BillingSummaryResponse,
  UsageResponse,
  PaginatedResponse_UsageResponse_,
  UsagePeriodSummaryResponse,
  BalanceTransactionType,
  type,
  BalanceTransactionResponse,
  PaginatedResponse_BalanceTransactionResponse_,
  EndpointHealthResponse,
  WebhookResponse,
  CreateWebhookRequest,
  WebhookCreatedResponse,
  EventCatalogEntryResponse,
  EventCatalogResponse,
  UpdateWebhookRequest,
  TestWebhookRequest,
  TestWebhookResponse,
  success,
  DeliveryAttemptResponse,
  PaginatedResponse_DeliveryAttemptResponse_,
  BulkReplayRequest,
  BulkReplayResponse,
  AlertNotificationVersion,
  AlertNotificationDestinationResponse,
  SetDestinationVersionRequest,
  CampaignOverridesResponse,
  SetCampaignOverridesRequest,
  InvoiceType,
  type__2,
  InvoiceStatus,
  status__3,
  InvoiceResponse,
  PaginatedResponse_InvoiceResponse_,
  InvoicePdfUrlResponse,
  SubmitContactInquiryRequest,
  ContactInquiryAcknowledgement,
  PreferredContactChannel,
  SubmitDemoInquiryRequest,
  DemoInquiryAcknowledgement,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/account",
    description: `Return the caller&#x27;s organization.`,
    requestFormat: "json",
    response: OrgResponse,
  },
  {
    method: "patch",
    path: "/api/v1/account",
    description: `Update the caller&#x27;s organization name.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateOrgRequest,
      },
    ],
    response: OrgResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/account/api-keys",
    description: `List API keys in the caller&#x27;s organization.`,
    requestFormat: "json",
    response: z.array(ApiKeyResponse),
  },
  {
    method: "post",
    path: "/api/v1/account/api-keys",
    description: `Create a new API key (full key shown once).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateApiKeyRequest,
      },
    ],
    response: ApiKeyCreatedResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v1/account/api-keys/:key_id",
    description: `Revoke (delete) an API key.`,
    requestFormat: "json",
    parameters: [
      {
        name: "key_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/account/labels",
    description: `List custom label definitions for the caller&#x27;s organization.`,
    requestFormat: "json",
    response: z.array(LabelDefinitionResponse),
  },
  {
    method: "put",
    path: "/api/v1/account/labels",
    description: `Replace all custom label definitions for the organization.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateLabelDefinitionsRequest,
      },
    ],
    response: z.array(LabelDefinitionResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/account/roles",
    description: `List roles available to the caller&#x27;s organization.`,
    requestFormat: "json",
    response: z.array(RoleResponse),
  },
  {
    method: "post",
    path: "/api/v1/account/roles",
    description: `Create a custom role for the organization.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateCustomRoleRequest,
      },
    ],
    response: RoleResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/account/users",
    description: `List users in the caller&#x27;s organization.`,
    requestFormat: "json",
    response: z.array(UserResponse),
  },
  {
    method: "delete",
    path: "/api/v1/account/users/:user_id",
    description: `Soft-delete a user from the organization.`,
    requestFormat: "json",
    parameters: [
      {
        name: "user_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/account/users/:user_id/role",
    description: `Change a user&#x27;s role within the organization.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ role_id: z.string().uuid() }).passthrough(),
      },
      {
        name: "user_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/account/users/:user_id/transfer-ownership",
    description: `Transfer organization ownership to another user.`,
    requestFormat: "json",
    parameters: [
      {
        name: "user_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/account/users/invite",
    description: `Invite a new user to the caller&#x27;s organization.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: InviteUserRequest,
      },
    ],
    response: UserResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/alert-notifications/campaigns/:campaign_id/overrides",
    description: `Read the campaign&#x27;s notification mode + override list.`,
    requestFormat: "json",
    parameters: [
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignOverridesResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/api/v1/alert-notifications/campaigns/:campaign_id/overrides",
    description: `Replace the campaign&#x27;s notification mode + override list.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SetCampaignOverridesRequest,
      },
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/alert-notifications/destinations",
    description: `List every destination owned by the caller&#x27;s organization.`,
    requestFormat: "json",
    response: z.array(AlertNotificationDestinationResponse),
  },
  {
    method: "delete",
    path: "/api/v1/alert-notifications/destinations/:destination_id",
    description: `Delete one destination.`,
    requestFormat: "json",
    parameters: [
      {
        name: "destination_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/alert-notifications/destinations/:destination_id/version",
    description: `Switch the destination&#x27;s report-link version (public vs internal).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SetDestinationVersionRequest,
      },
      {
        name: "destination_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/alerts",
    description: `List alerts for the caller&#x27;s organization with pagination + filters.

&#x60;&#x60;limit&#x60;&#x60; is capped at 200; requests above that return 422 rather
than a silently downgraded response. Iterate through all results
using &#x60;&#x60;page&#x60;&#x60;/&#x60;&#x60;limit&#x60;&#x60; and the returned &#x60;&#x60;total&#x60;&#x60;/&#x60;&#x60;pages&#x60;&#x60;.

Note: &#x60;&#x60;offset&#x60;&#x60; was removed in favour of &#x60;&#x60;page&#x60;&#x60; — sending
&#x60;&#x60;offset&#x60;&#x60; has no effect.`,
    requestFormat: "json",
    parameters: [
      {
        name: "campaign_id",
        type: "Query",
        schema: status,
      },
      {
        name: "status",
        type: "Query",
        schema: status__2,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_AlertResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/alerts/:alert_id/status",
    description: `Update an alert&#x27;s status.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateAlertStatusRequest,
      },
      {
        name: "alert_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/alerts/stats",
    description: `Get alert statistics grouped by status.`,
    requestFormat: "json",
    response: AlertStatsResponse,
  },
  {
    method: "get",
    path: "/api/v1/billing",
    description: `Get billing summary for caller&#x27;s organization.`,
    requestFormat: "json",
    response: BillingSummaryResponse,
  },
  {
    method: "get",
    path: "/api/v1/billing/history",
    description: `Return caller-org balance history (ledger rows) with filters + pagination.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "date_from",
        type: "Query",
        schema: status,
      },
      {
        name: "date_to",
        type: "Query",
        schema: status,
      },
      {
        name: "type",
        type: "Query",
        schema: type,
      },
    ],
    response: PaginatedResponse_BalanceTransactionResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/billing/usage",
    description: `List usage records for caller&#x27;s organization.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
      {
        name: "date_from",
        type: "Query",
        schema: status,
      },
      {
        name: "date_to",
        type: "Query",
        schema: status,
      },
      {
        name: "scan_id",
        type: "Query",
        schema: status,
      },
    ],
    response: PaginatedResponse_UsageResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/billing/usage/summary",
    description: `Return a one-line aggregate of caller-org usage over the current period.`,
    requestFormat: "json",
    response: UsagePeriodSummaryResponse,
  },
  {
    method: "post",
    path: "/api/v1/campaign-groups",
    description: `Create a new campaign group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().min(1).max(200) }).passthrough(),
      },
    ],
    response: CampaignGroupResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/campaign-groups",
    description: `List campaign groups filtered by archive status.`,
    requestFormat: "json",
    parameters: [
      {
        name: "archived",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
    ],
    response: z.array(CampaignGroupResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/campaign-groups/:group_id",
    description: `Return a single campaign group by ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "group_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignGroupResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/campaign-groups/:group_id",
    description: `Rename a campaign group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateCampaignGroupRequest,
      },
      {
        name: "group_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignGroupResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaign-groups/:group_id/archive",
    description: `Cascade-archive the group and all its campaigns.`,
    requestFormat: "json",
    parameters: [
      {
        name: "group_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: GroupActionResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaign-groups/:group_id/cancel",
    description: `Cancel pending scans for every non-archived campaign in the group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "group_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: GroupActionResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaign-groups/:group_id/pause-schedule",
    description: `Pause the schedule for every campaign in the group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "group_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignGroupResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaign-groups/:group_id/resume-schedule",
    description: `Resume the schedule for every campaign in the group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "group_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignGroupResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaign-groups/:group_id/run",
    description: `Trigger a run for every non-archived campaign in the group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "group_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: GroupActionResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaign-groups/:group_id/unarchive",
    description: `Cascade-unarchive the group and all its campaigns.`,
    requestFormat: "json",
    parameters: [
      {
        name: "group_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: GroupActionResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaigns",
    description: `Create a new campaign.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateCampaignRequest,
      },
    ],
    response: CampaignResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/campaigns",
    description: `List campaigns with optional filters + pagination.

&#x60;&#x60;limit&#x60;&#x60; is capped at 200; requests above that are rejected with 422
rather than silently downgraded. Use &#x60;&#x60;page&#x60;&#x60; + &#x60;&#x60;limit&#x60;&#x60; to iterate
through all results using the returned &#x60;&#x60;total&#x60;&#x60;/&#x60;&#x60;pages&#x60;&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "archived",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
      {
        name: "group_id",
        type: "Query",
        schema: status,
      },
      {
        name: "q",
        type: "Query",
        schema: status,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_CampaignResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/campaigns/:campaign_id",
    description: `Get a single campaign by ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/campaigns/:campaign_id",
    description: `Update campaign config. Only affects future runs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateCampaignRequest,
      },
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaigns/:campaign_id/archive",
    description: `Move a campaign to the archive.`,
    requestFormat: "json",
    parameters: [
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaigns/:campaign_id/cancel",
    description: `Cancel all pending scans for a campaign.`,
    requestFormat: "json",
    parameters: [
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ cancelled_count: z.number().int() }).passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaigns/:campaign_id/run",
    description: `Trigger a new run for all campaign geos.`,
    requestFormat: "json",
    parameters: [
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: RunResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/campaigns/:campaign_id/runs",
    description: `List run history for a campaign (paginated).

&#x60;&#x60;limit&#x60;&#x60; is capped at 200 — runs accrue over time (daily cron
campaigns build up thousands of rows), so iteration via
&#x60;&#x60;page&#x60;&#x60;/&#x60;&#x60;limit&#x60;&#x60; is mandatory instead of a single unbounded
response.`,
    requestFormat: "json",
    parameters: [
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_RunResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/campaigns/:campaign_id/unarchive",
    description: `Restore a campaign from the archive.`,
    requestFormat: "json",
    parameters: [
      {
        name: "campaign_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CampaignResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/campaigns/picker",
    description: `Capped lightweight list for dropdown / combobox consumers.

&#x60;&#x60;limit&#x60;&#x60; is capped at 100 (no pagination). For full iteration use
the paginated &#x60;&#x60;GET /api/v1/campaigns&#x60;&#x60; endpoint.`,
    requestFormat: "json",
    parameters: [
      {
        name: "archived",
        type: "Query",
        schema: z.boolean().optional().default(false),
      },
      {
        name: "group_id",
        type: "Query",
        schema: status,
      },
      {
        name: "q",
        type: "Query",
        schema: status,
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(100).optional().default(50),
      },
    ],
    response: z.array(CampaignPickerItem),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/contact",
    description: `Accept a contact-form submission from the public marketing site.

Returns &#x60;&#x60;200 OK&#x60;&#x60; with an opaque inquiry id on success and
&#x60;&#x60;429 Too Many Requests&#x60;&#x60; when the same client IP submits more
than the configured limit (default 5/hour).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SubmitContactInquiryRequest,
      },
    ],
    response: ContactInquiryAcknowledgement,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/custom-rules",
    description: `Create a custom tag rule.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateCustomRuleRequest,
      },
    ],
    response: CustomRuleResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/custom-rules",
    description: `List custom rules for the caller&#x27;s organization (paginated).

&#x60;&#x60;limit&#x60;&#x60; is capped at 200 — iterate via &#x60;&#x60;page&#x60;&#x60; + &#x60;&#x60;limit&#x60;&#x60; and
the returned &#x60;&#x60;total&#x60;&#x60; / &#x60;&#x60;pages&#x60;&#x60;.`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_CustomRuleResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/custom-rules/:rule_id",
    description: `Get a custom tag rule by ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "rule_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CustomRuleResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/api/v1/custom-rules/:rule_id",
    description: `Update a custom tag rule.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateCustomRuleRequest,
      },
      {
        name: "rule_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: CustomRuleResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v1/custom-rules/:rule_id",
    description: `Delete a custom tag rule.`,
    requestFormat: "json",
    parameters: [
      {
        name: "rule_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/custom-rules/test",
    description: `Test a rule against an existing scan (real execution via checkers).`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RuleTestRequest,
      },
    ],
    response: RuleTestResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/demo-inquiries",
    description: `Accept a Request-a-Demo submission from the public marketing site.

Returns &#x60;&#x60;200 OK&#x60;&#x60; with an opaque inquiry id on success and
&#x60;&#x60;429 Too Many Requests&#x60;&#x60; with code
&#x60;&#x60;marketing.demo_inquiry_rate_limited&#x60;&#x60; when the same client IP
submits more than the configured limit (default 5/hour). The UI
branches on the &#x60;&#x60;code&#x60;&#x60; field to show a &quot;wait a few minutes&quot;
line instead of a generic toast.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SubmitDemoInquiryRequest,
      },
    ],
    response: DemoInquiryAcknowledgement,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/emulators",
    description: `Return all active emulators in the catalog.`,
    requestFormat: "json",
    response: z.array(EmulatorResponse),
  },
  {
    method: "get",
    path: "/api/v1/geos",
    description: `Return all supported geographic regions.`,
    requestFormat: "json",
    response: z.array(GeoResponse),
  },
  {
    method: "get",
    path: "/api/v1/invoices",
    description: `List caller-org invoices with optional filters + pagination.`,
    requestFormat: "json",
    parameters: [
      {
        name: "type",
        type: "Query",
        schema: type__2,
      },
      {
        name: "status",
        type: "Query",
        schema: status__3,
      },
      {
        name: "organization_id",
        type: "Query",
        schema: status,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_InvoiceResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/invoices/:invoice_id/pdf",
    description: `Return a time-limited signed URL for the invoice PDF (or &#x60;&#x60;ready&#x3D;false&#x60;&#x60;).`,
    requestFormat: "json",
    parameters: [
      {
        name: "invoice_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: InvoicePdfUrlResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/policy-sets",
    description: `Create a policy set.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreatePolicySetRequest,
      },
    ],
    response: PolicySetResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/policy-sets",
    description: `List accessible policy sets for the caller&#x27;s organization (paginated).

&#x60;&#x60;limit&#x60;&#x60; is capped at 200; requests above that return 422 rather
than silent downgrade.`,
    requestFormat: "json",
    parameters: [
      {
        name: "visibility",
        type: "Query",
        schema: visibility,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_PolicySetListItem_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/policy-sets/:policy_set_id",
    description: `Get a policy set by ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "policy_set_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: PolicySetResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/api/v1/policy-sets/:policy_set_id",
    description: `Update a policy set.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdatePolicySetRequest,
      },
      {
        name: "policy_set_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: PolicySetResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v1/policy-sets/:policy_set_id",
    description: `Delete a policy set.`,
    requestFormat: "json",
    parameters: [
      {
        name: "policy_set_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/policy-sets/:policy_set_id/request-approval",
    description: `Request public approval for a policy set.`,
    requestFormat: "json",
    parameters: [
      {
        name: "policy_set_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/runs/:run_id",
    description: `Get run detail with progress counters.`,
    requestFormat: "json",
    parameters: [
      {
        name: "run_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: RunResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/runs/:run_id/cancel",
    description: `Cancel all pending scans for a run.`,
    requestFormat: "json",
    parameters: [
      {
        name: "run_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ cancelled_count: z.number().int() }).passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/runs/:run_id/scans",
    description: `List scan tiles for a run (paginated).

&#x60;&#x60;limit&#x60;&#x60; is capped at 200. Iterate via &#x60;&#x60;page&#x60;&#x60;/&#x60;&#x60;limit&#x60;&#x60; using
the returned &#x60;&#x60;total&#x60;&#x60;/&#x60;&#x60;pages&#x60;&#x60; fields.`,
    requestFormat: "json",
    parameters: [
      {
        name: "run_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_ScanTileResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/scans",
    description: `Create a new scan for a single URL + country.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateScanRequest,
      },
    ],
    response: ScanResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/scans",
    description: `List scans with filters. Comma-separated values for multi-select.`,
    requestFormat: "json",
    parameters: [
      {
        name: "status",
        type: "Query",
        schema: status,
      },
      {
        name: "country_code",
        type: "Query",
        schema: status,
      },
      {
        name: "url",
        type: "Query",
        schema: status,
      },
      {
        name: "scan_id",
        type: "Query",
        schema: status,
      },
      {
        name: "date_from",
        type: "Query",
        schema: status,
      },
      {
        name: "date_to",
        type: "Query",
        schema: status,
      },
      {
        name: "timezone",
        type: "Query",
        schema: status,
      },
      {
        name: "run_id",
        type: "Query",
        schema: status,
      },
      {
        name: "campaign_id",
        type: "Query",
        schema: status,
      },
      {
        name: "group_id",
        type: "Query",
        schema: status,
      },
      {
        name: "tag",
        type: "Query",
        schema: status,
      },
      {
        name: "iab_category",
        type: "Query",
        schema: status,
      },
      {
        name: "brand",
        type: "Query",
        schema: status,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).lte(500).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_ScanBriefResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/scans/:scan_id",
    description: `Get a scan by ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "scan_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: ScanResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/scans/:scan_id/cancel",
    description: `Cancel a single pending scan.`,
    requestFormat: "json",
    parameters: [
      {
        name: "scan_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.object({ cancelled_count: z.number().int() }).passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/scans/:scan_id/creative-screenshot",
    description: `Serve creative screenshot for ad tag scans. Public endpoint.`,
    requestFormat: "json",
    parameters: [
      {
        name: "scan_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "w",
        type: "Query",
        schema: w,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/scans/:scan_id/landings/:landing_ord/screenshot",
    description: `Serve one landing-tab screenshot for an ad-tag scan. Public endpoint.`,
    requestFormat: "json",
    parameters: [
      {
        name: "scan_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "landing_ord",
        type: "Path",
        schema: z.number().int(),
      },
      {
        name: "w",
        type: "Query",
        schema: w,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/scans/:scan_id/screenshot",
    description: `Serve screenshot, optionally resized to *w* pixels wide. Public endpoint.`,
    requestFormat: "json",
    parameters: [
      {
        name: "scan_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "w",
        type: "Query",
        schema: w,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/scans/:scan_id/tags",
    description: `List all tags for a scan.`,
    requestFormat: "json",
    parameters: [
      {
        name: "scan_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.array(ScanTagResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/scans/bulk",
    description: `Create scans for a URL across multiple countries at once.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BulkScanRequest,
      },
    ],
    response: z.array(ScanResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/scans/recheck",
    description: `Re-check completed scans through the checker pipeline with current rules.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RecheckRequest,
      },
    ],
    response: z.object({ queued_count: z.number().int() }).passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/tag-definitions",
    description: `List all available tag definitions with usage statistics.`,
    requestFormat: "json",
    parameters: [
      {
        name: "category",
        type: "Query",
        schema: status,
      },
    ],
    response: z.array(TagDefinitionWithStatsResponse),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/tag-definitions/:slug",
    description: `Get a tag definition with linked rules.`,
    requestFormat: "json",
    parameters: [
      {
        name: "slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: TagDefinitionDetailResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/tag-definitions/:slug",
    description: `Update display_name and/or description of a custom tag definition.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateTagDefinitionRequest,
      },
      {
        name: "slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v1/tag-definitions/:slug",
    description: `Delete a custom tag definition. Scan tag assignments cascade-delete.`,
    requestFormat: "json",
    parameters: [
      {
        name: "slug",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/webhooks",
    requestFormat: "json",
    response: z.array(WebhookResponse),
  },
  {
    method: "post",
    path: "/api/v1/webhooks",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateWebhookRequest,
      },
    ],
    response: WebhookCreatedResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/webhooks/:endpoint_id",
    requestFormat: "json",
    parameters: [
      {
        name: "endpoint_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: WebhookResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "patch",
    path: "/api/v1/webhooks/:endpoint_id",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateWebhookRequest,
      },
      {
        name: "endpoint_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: WebhookResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/api/v1/webhooks/:endpoint_id",
    requestFormat: "json",
    parameters: [
      {
        name: "endpoint_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/webhooks/:endpoint_id/deliveries",
    requestFormat: "json",
    parameters: [
      {
        name: "endpoint_id",
        type: "Path",
        schema: z.string().uuid(),
      },
      {
        name: "success",
        type: "Query",
        schema: success,
      },
      {
        name: "from_ts",
        type: "Query",
        schema: status,
      },
      {
        name: "to_ts",
        type: "Query",
        schema: status,
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().gte(1).optional().default(1),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(200).optional().default(50),
      },
    ],
    response: PaginatedResponse_DeliveryAttemptResponse_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/webhooks/:endpoint_id/replay",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BulkReplayRequest,
      },
      {
        name: "endpoint_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: BulkReplayResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/webhooks/:endpoint_id/rotate-secret",
    requestFormat: "json",
    parameters: [
      {
        name: "endpoint_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: WebhookCreatedResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/webhooks/:endpoint_id/test",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ event_type: z.string() }).passthrough(),
      },
      {
        name: "endpoint_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: TestWebhookResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/api/v1/webhooks/deliveries/:attempt_id/replay",
    requestFormat: "json",
    parameters: [
      {
        name: "attempt_id",
        type: "Path",
        schema: z.string().uuid(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/webhooks/event-types",
    requestFormat: "json",
    response: EventCatalogResponse,
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
