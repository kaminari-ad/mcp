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
 * Regen is manual and ungated, same as openapi.ts.
 */

/* eslint-disable */

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

const OrganizationStatus = z.enum([
  "pending_email_verification",
  "pending_admin_approval",
  "active",
  "suspended",
  "rejected",
]);
const OrgTransitionAction = z.enum(["approve", "reject", "suspend", "reactivate"]);
const OrgTransitionOptionResponse = z
  .object({ target_status: OrganizationStatus, action: OrgTransitionAction })
  .passthrough();
const OrgResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    owner_id: z.union([z.string(), z.null()]),
    status: OrganizationStatus,
    domain: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    available_transitions: z.array(OrgTransitionOptionResponse).optional().default([]),
    is_active: z.boolean(),
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
    role_id: z.string().uuid(),
    role_name: z.string(),
    role_scope: z.string().optional().default("org"),
    organization_id: z.string().uuid(),
    organization_name: z.string(),
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
const RepeatModeType = z.enum(["isolated", "shared"]);
const CreateScanRequest = z
  .object({
    url: z.union([z.string(), z.null()]).optional(),
    ad_tag: z.union([z.string(), z.null()]).optional(),
    vast_tag: z.union([z.string(), z.null()]).optional(),
    referrer: z.union([z.string(), z.null()]).optional(),
    country_code: z.string().min(2).max(2),
    emulator_id: z.string().min(1).max(100),
    proxy: ProxyTargetRequest.optional(),
    labels: z.record(z.string()).optional(),
    campaign_id: z.union([z.string(), z.null()]).optional(),
    run_id: z.union([z.string(), z.null()]).optional(),
    ad_discovery: z.boolean().optional().default(false),
    repeat_count: z.number().int().gte(1).optional().default(1),
    repeat_mode: RepeatModeType.optional(),
    retry_max_attempts: z.number().int().gte(0).optional().default(0),
  })
  .passthrough();
const ScanStatus = z.enum([
  "pending",
  "running",
  "crawled",
  "checking",
  "checking_async",
  "rechecking",
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
const VideoMetaResponse = z
  .object({
    duration_ms: z.number().int().default(0),
    mediafile_url: z.string().default(""),
    vast_version: z.string().default(""),
    ad_system: z.string().default(""),
    is_vpaid: z.boolean().default(false),
    wrapper_depth: z.number().int().default(0),
    click_through: z.string().default(""),
  })
  .partial()
  .passthrough();
const ProxyTargetResponse = z
  .object({
    proxy_type: z.string(),
    region: z.string().optional().default(""),
    city: z.string().optional().default(""),
    isp: z.string().optional().default(""),
  })
  .passthrough();
const AiCategoryResponse = z
  .object({
    tier1: z.string(),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const IabV3CategoryResponse = z
  .object({
    tier1: z.string(),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const ScanTaxonomyClassificationResponse = z
  .object({
    taxonomy_id: z.string().uuid(),
    taxonomy_name: z.string(),
    taxonomy_slug: z.string(),
    taxonomy_version: z.number().int(),
    leaf_node_id: z.union([z.string(), z.null()]),
    tier1: z.union([z.string(), z.null()]),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
    used_default: z.boolean().optional().default(false),
  })
  .passthrough();
const ScanClassificationResponse = z
  .object({
    brand: z.union([z.string(), z.null()]),
    ai_category: z.union([AiCategoryResponse, z.null()]),
    iab_v3: z.union([IabV3CategoryResponse, z.null()]),
    custom_taxonomies: z.array(ScanTaxonomyClassificationResponse).default([]),
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
    parent_scan_id: z.union([z.string(), z.null()]).optional(),
    ad_discovery: z.boolean().optional().default(false),
    slot_index: z.union([z.number(), z.null()]).optional(),
    ad_kind: z.union([z.string(), z.null()]).optional(),
    network: z.string().optional().default(""),
    offer_url: z.string(),
    redirect_chain: z.array(RedirectHopResponse),
    screenshot_url: z.string().optional().default(""),
    report_url: z.string().optional().default(""),
    public_report_url: z.string().optional().default(""),
    ad_tag: z.union([z.string(), z.null()]).optional(),
    vast_tag: z.union([z.string(), z.null()]).optional(),
    referrer: z.union([z.string(), z.null()]).optional(),
    creative_kind: z.enum(["banner", "video"]).optional().default("banner"),
    creative_screenshot_url: z.string().optional().default(""),
    creative_video_url: z.string().optional().default(""),
    vast_xml_url: z.string().optional().default(""),
    creative_html_url: z.string().optional().default(""),
    creative_width: z.number().int().optional().default(0),
    creative_height: z.number().int().optional().default(0),
    video: z.union([VideoMetaResponse, z.null()]).optional(),
    proxy: z.union([ProxyTargetResponse, z.null()]).optional(),
    page_title: z.string(),
    elapsed_ms: z.number().int(),
    error: z.string(),
    labels: z.record(z.string()).optional(),
    classification: z.union([ScanClassificationResponse, z.null()]).optional(),
    campaign_id: z.union([z.string(), z.null()]).optional(),
    campaign_name: z.union([z.string(), z.null()]).optional(),
    campaign_group_id: z.union([z.string(), z.null()]).optional(),
    campaign_group_name: z.union([z.string(), z.null()]).optional(),
    created_at: z.string().datetime({ offset: true }),
    completed_at: z.union([z.string(), z.null()]),
    landings: z.array(LandingResponse).optional(),
    repeat_index: z.number().int().optional().default(0),
    repeat_total: z.number().int().optional().default(1),
    repeat_session_id: z.union([z.string(), z.null()]).optional(),
    repeat_scan_ids: z.array(z.string().uuid()).optional(),
    retry_attempt: z.number().int().optional().default(0),
    retry_max_attempts: z.number().int().optional().default(0),
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
    report_url: z.string().optional().default(""),
    public_report_url: z.string().optional().default(""),
    labels: z.record(z.string()).optional(),
    classification: z.union([ScanClassificationResponse, z.null()]).optional(),
    elapsed_ms: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    campaign_id: z.union([z.string(), z.null()]).optional(),
    campaign_name: z.union([z.string(), z.null()]).optional(),
    is_ad_tag: z.boolean().optional().default(false),
    is_vast: z.boolean().optional().default(false),
    parent_scan_id: z.union([z.string(), z.null()]).optional(),
    ad_discovery: z.boolean().optional().default(false),
    slot_index: z.union([z.number(), z.null()]).optional(),
    ad_kind: z.union([z.string(), z.null()]).optional(),
    network: z.string().optional().default(""),
    emulator_display_name: z.string().optional().default(""),
    emulator_category: z.string().optional().default(""),
    repeat_index: z.number().int().optional().default(0),
    repeat_total: z.number().int().optional().default(1),
    repeat_session_id: z.union([z.string(), z.null()]).optional(),
    retry_attempt: z.number().int().optional().default(0),
    retry_max_attempts: z.number().int().optional().default(0),
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
    vast_tag: z.union([z.string(), z.null()]).optional(),
    referrer: z.union([z.string(), z.null()]).optional(),
    country_codes: z.array(z.string()).min(1),
    emulator_id: z.string().min(1).max(100),
    proxy: ProxyTargetRequest.optional(),
    labels: z.record(z.string()).optional(),
    repeat_count: z.number().int().gte(1).optional().default(1),
    repeat_mode: RepeatModeType.optional(),
    retry_max_attempts: z.number().int().gte(0).optional().default(0),
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
const ProxyTargetingResponse = z
  .object({
    country_code: z.string(),
    proxy_type: z.string(),
    regions: z.array(z.string()),
    cities: z.array(z.string()),
    isps: z.array(z.string()),
    refreshed_at: z.union([z.string(), z.null()]),
    ttl_seconds: z.number().int(),
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
    last_run_at: z.union([z.string(), z.null()]).optional(),
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
const RepeatMode = z.enum(["isolated", "shared"]);
const CreateCampaignRequest = z
  .object({
    name: z.string().min(1).max(200),
    campaign_type: z.string().optional().default("url"),
    url: z.union([z.string(), z.null()]).optional(),
    ad_tag: z.union([z.string(), z.null()]).optional(),
    vast_tag: z.union([z.string(), z.null()]).optional(),
    referrer: z.union([z.string(), z.null()]).optional(),
    country_codes: z.array(z.string()).min(1),
    group_id: z.union([z.string(), z.null()]).optional(),
    emulator_categories: z.array(z.string()).optional(),
    emulator_specific_ids: z.array(z.string()).optional(),
    emulator_mode: z.string().optional().default("random"),
    proxy_type: z.string().optional().default("residential"),
    proxy_region: z.string().optional().default(""),
    proxy_city: z.string().optional().default(""),
    proxy_isp: z.string().optional().default(""),
    repeat_count: z.number().int().gte(1).optional().default(1),
    repeat_mode: RepeatMode.optional(),
    retry_max_attempts: z.number().int().gte(0).optional().default(0),
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
    vast_tag: z.union([z.string(), z.null()]).optional(),
    referrer: z.union([z.string(), z.null()]).optional(),
    country_codes: z.array(z.string()),
    group_id: z.string().uuid(),
    emulator_selection: EmulatorSelectionResponse,
    proxy_type: z.string().optional().default("residential"),
    proxy_region: z.string().optional().default(""),
    proxy_city: z.string().optional().default(""),
    proxy_isp: z.string().optional().default(""),
    repeat_count: z.number().int().optional().default(1),
    repeat_mode: RepeatMode.optional(),
    retry_max_attempts: z.number().int().optional().default(0),
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
    policy_set_id: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const UpdateCampaignRequest = z
  .object({
    name: z.union([z.string(), z.null()]),
    url: z.union([z.string(), z.null()]),
    ad_tag: z.union([z.string(), z.null()]),
    vast_tag: z.union([z.string(), z.null()]),
    referrer: z.union([z.string(), z.null()]),
    country_codes: z.union([z.array(z.string()), z.null()]),
    group_id: z.union([z.string(), z.null()]),
    emulator_categories: z.union([z.array(z.string()), z.null()]),
    emulator_specific_ids: z.union([z.array(z.string()), z.null()]),
    emulator_mode: z.union([z.string(), z.null()]),
    proxy_type: z.union([z.string(), z.null()]),
    proxy_region: z.union([z.string(), z.null()]),
    proxy_city: z.union([z.string(), z.null()]),
    proxy_isp: z.union([z.string(), z.null()]),
    repeat_count: z.union([z.number(), z.null()]),
    repeat_mode: z.union([RepeatMode, z.null()]),
    retry_max_attempts: z.union([z.number(), z.null()]),
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
    report_url: z.string().optional().default(""),
    public_report_url: z.string().optional().default(""),
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
    surface: z.string().optional().default("page"),
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
    scope: z.string(),
    organization_id: z.union([z.string(), z.null()]),
    visibility: z.string(),
    severity: z.string(),
    scans_count: z.number().int(),
    rules_count: z.number().int(),
    archived_at: z.union([z.string(), z.null()]).optional(),
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
    scope: z.string(),
    organization_id: z.union([z.string(), z.null()]),
    visibility: z.string(),
    severity: z.string(),
    scans_count: z.number().int(),
    rules_count: z.number().int(),
    archived_at: z.union([z.string(), z.null()]).optional(),
    linked_rules: z.array(LinkedRuleResponse).optional(),
  })
  .passthrough();
const TagVisibility = z.enum(["hidden", "internal", "public"]);
const TagSeverity = z.enum(["high", "medium", "low"]);
const UpdateTagDefinitionRequest = z
  .object({
    display_name: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    visibility: z.union([TagVisibility, z.null()]),
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
    tag_visibility: z.union([z.record(TagVisibility), z.null()]).optional(),
  })
  .passthrough();
const CustomRuleResponse = z
  .object({
    id: z.string().uuid(),
    organization_id: z.union([z.string(), z.null()]),
    name: z.string(),
    tag_slug: z.string(),
    rule_type: z.string(),
    config: z.object({}).partial().passthrough(),
    target: z.string(),
    is_active: z.boolean(),
    created_at: z.string().datetime({ offset: true }),
    scope: z.string().optional().default("personal"),
    tag_visibility: z.record(z.string()).optional(),
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
    tag_visibility: z.union([z.record(TagVisibility), z.null()]),
  })
  .partial()
  .passthrough();
const RuleTestRequest = z
  .object({
    scan_id: z.string().uuid(),
    rule_type: z.string(),
    config: z.object({}).partial().passthrough(),
    target: z.string().optional().default("page"),
    name: z.string().optional().default("Test Rule"),
    context: z.enum(["isolated", "production"]).optional().default("isolated"),
    rule_id: z.union([z.string(), z.null()]).optional(),
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
const IabV3PolicyCategoryRequest = z
  .object({
    tier1: z.string().min(1).max(200),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const AiCategoryRequest = z
  .object({
    tier1: z.string().min(1).max(200),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const CustomTaxonomyRefRequest = z
  .object({
    taxonomy_id: z.string().uuid(),
    tier1: z.string().min(1).max(200),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PolicyEntryRequest = z
  .object({
    rule_type: z.enum(["tag", "iab_v3", "brand", "ai_category", "custom_taxonomy"]).default("tag"),
    tag_slug: z.union([z.string(), z.null()]),
    iab_v3: z.union([IabV3PolicyCategoryRequest, z.null()]),
    brand: z.union([z.string(), z.null()]),
    ai_category: z.union([AiCategoryRequest, z.null()]),
    custom_taxonomy: z.union([CustomTaxonomyRefRequest, z.null()]),
    country_codes: z.array(z.string()).max(50),
  })
  .partial()
  .passthrough();
const CreatePolicySetRequest = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional().default(""),
    entries: z.array(PolicyEntryRequest).min(1).max(500),
    campaign_ids: z.array(z.string().uuid()).max(2000).optional(),
  })
  .passthrough();
const PolicyEntryIabV3Response = z
  .object({
    tier1: z.string(),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PolicyEntryAiCategoryResponse = z
  .object({
    tier1: z.string(),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PolicyEntryCustomTaxonomyResponse = z
  .object({
    taxonomy_id: z.string().uuid(),
    tier1: z.string(),
    tier2: z.union([z.string(), z.null()]).optional(),
    tier3: z.union([z.string(), z.null()]).optional(),
    tier4: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const PolicyEntryResponse = z
  .object({
    id: z.string().uuid(),
    rule_type: z.string(),
    tag_slug: z.union([z.string(), z.null()]).optional(),
    iab_v3: z.union([PolicyEntryIabV3Response, z.null()]).optional(),
    brand: z.union([z.string(), z.null()]).optional(),
    ai_category: z.union([PolicyEntryAiCategoryResponse, z.null()]).optional(),
    custom_taxonomy: z.union([PolicyEntryCustomTaxonomyResponse, z.null()]).optional(),
    country_codes: z.array(z.string()),
  })
  .passthrough();
const LinkedCampaignResponse = z
  .object({ id: z.string().uuid(), name: z.string(), is_archived: z.boolean() })
  .passthrough();
const PolicySetResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    organization_id: z.string().uuid(),
    visibility: z.string(),
    is_approved: z.boolean(),
    is_default: z.boolean(),
    entries: z.array(PolicyEntryResponse),
    campaigns: z.array(LinkedCampaignResponse).optional(),
    campaigns_total: z.number().int().optional().default(0),
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
    is_default: z.boolean(),
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
    campaign_ids: z.array(z.string().uuid()).max(2000).optional(),
  })
  .passthrough();
const PaginatedResponse_LinkedCampaignResponse_ = z
  .object({
    items: z.array(LinkedCampaignResponse),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
  })
  .passthrough();
const AttachCampaignsRequest = z
  .object({ campaign_ids: z.array(z.string().uuid()).min(1).max(500) })
  .passthrough();
const DetachCampaignsRequest = z
  .object({
    campaign_ids: z.array(z.string().uuid()).max(500),
    detach_all: z.boolean().default(false),
  })
  .partial()
  .passthrough();
const SetDefaultPolicySetRequest = z.object({ is_default: z.boolean() }).passthrough();
const AlertStatus = z.enum(["open", "escalated", "resolved", "dismissed"]);
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
    status: AlertStatus,
    closed_by: z.union([z.string(), z.null()]),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.union([z.string(), z.null()]),
    scan_url: z.string(),
    offer_url: z.string(),
    tag_display_name: z.string(),
    policy_set_name: z.union([z.string(), z.null()]).optional(),
    rule_type: z.string().optional().default("tag"),
    matched_value: z.union([z.string(), z.null()]).optional(),
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
const BulkUpdateAlertStatusRequest = z
  .object({
    status: AlertStatus,
    ids: z.union([z.array(z.string().uuid()), z.null()]).optional(),
    all_matching: z.boolean().optional().default(false),
    filter_status: z.union([AlertStatus, z.null()]).optional(),
    filter_campaign_id: z.union([z.string(), z.null()]).optional(),
    filter_policy_set_ids: z.union([z.array(z.string().uuid()), z.null()]).optional(),
    filter_tag_slugs: z.union([z.array(z.string()), z.null()]).optional(),
    filter_country_codes: z.union([z.array(z.string()), z.null()]).optional(),
    filter_date_from: z.union([z.string(), z.null()]).optional(),
    filter_date_to: z.union([z.string(), z.null()]).optional(),
    filter_timezone: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const BulkUpdateAlertStatusResponse = z
  .object({ updated: z.number().int(), skipped: z.number().int() })
  .passthrough();
const AlertStatsResponse = z
  .object({
    open: z.number().int(),
    escalated: z.number().int(),
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
  "card_top_up",
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
    document_number: z.union([z.string(), z.null()]).optional(),
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
    failing_since: z.union([z.string(), z.null()]),
    paused_until: z.union([z.string(), z.null()]),
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
    included_statuses: z.array(z.string()),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const SetDestinationVersionRequest = z.object({ version: AlertNotificationVersion }).passthrough();
const CampaignOverrideMode = z.enum(["inherit", "override", "silence"]);
const CampaignOverridesResponse = z
  .object({
    campaign_id: z.string().uuid(),
    mode: CampaignOverrideMode,
    destination_ids: z.array(z.string().uuid()),
  })
  .passthrough();
const SetCampaignOverridesRequest = z
  .object({
    mode: CampaignOverrideMode,
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
    net_micros: z.number().int(),
    vat_micros: z.number().int(),
    vat_rate: z.string(),
    vat_reason: z.string(),
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
const CustomTaxonomyListItem = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    is_active: z.boolean(),
    version: z.number().int(),
    node_count: z.number().int(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const TaxonomyNodeRequest = z.object({
  client_id: z.string().min(1).max(100),
  parent_client_id: z.union([z.string(), z.null()]).optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(200).optional().default(""),
  is_default: z.boolean().optional().default(false),
});
const CreateCustomTaxonomyRequest = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(""),
  nodes: z.array(TaxonomyNodeRequest).optional().default([]),
});
const TaxonomyNodeResponse = z
  .object({
    id: z.string().uuid(),
    parent_id: z.union([z.string(), z.null()]),
    level: z.number().int(),
    position: z.number().int(),
    name: z.string(),
    description: z.string(),
    is_default: z.boolean(),
  })
  .passthrough();
const CustomTaxonomyResponse = z
  .object({
    id: z.string().uuid(),
    organization_id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    is_active: z.boolean(),
    version: z.number().int(),
    nodes: z.array(TaxonomyNodeResponse),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
const ParseTaxonomyTextRequest = z.object({
  text: z.string().min(1).max(50000),
});
const ParsedTaxonomyNode = z
  .object({
    level: z.number().int(),
    name: z.string(),
    description: z.string(),
  })
  .passthrough();
const ParseTaxonomyTextResponse = z
  .object({ nodes: z.array(ParsedTaxonomyNode), warnings: z.array(z.string()) })
  .passthrough();
const UpdateCustomTaxonomyRequest = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(""),
  nodes: z.array(TaxonomyNodeRequest).optional().default([]),
});
const TagMatchMode = z.enum(["any", "all"]);

export const schemas = {
  OrganizationStatus,
  OrgTransitionAction,
  OrgTransitionOptionResponse,
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
  RepeatModeType,
  CreateScanRequest,
  ScanStatus,
  SubRequestResponse,
  RedirectHopResponse,
  VideoMetaResponse,
  ProxyTargetResponse,
  AiCategoryResponse,
  IabV3CategoryResponse,
  ScanTaxonomyClassificationResponse,
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
  ProxyTargetingResponse,
  EmulatorResponse,
  CreateCampaignGroupRequest,
  CampaignGroupResponse,
  UpdateCampaignGroupRequest,
  BulkCampaignFailure,
  GroupActionResponse,
  RepeatMode,
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
  TagVisibility,
  TagSeverity,
  UpdateTagDefinitionRequest,
  CreateCustomRuleRequest,
  CustomRuleResponse,
  PaginatedResponse_CustomRuleResponse_,
  UpdateCustomRuleRequest,
  RuleTestRequest,
  RuleTestTagResult,
  RuleTestResponse,
  IabV3PolicyCategoryRequest,
  AiCategoryRequest,
  CustomTaxonomyRefRequest,
  PolicyEntryRequest,
  CreatePolicySetRequest,
  PolicyEntryIabV3Response,
  PolicyEntryAiCategoryResponse,
  PolicyEntryCustomTaxonomyResponse,
  PolicyEntryResponse,
  LinkedCampaignResponse,
  PolicySetResponse,
  VisibilityType,
  visibility,
  PolicySetListItem,
  PaginatedResponse_PolicySetListItem_,
  UpdatePolicySetRequest,
  PaginatedResponse_LinkedCampaignResponse_,
  AttachCampaignsRequest,
  DetachCampaignsRequest,
  SetDefaultPolicySetRequest,
  AlertStatus,
  status__2,
  AlertResponse,
  PaginatedResponse_AlertResponse_,
  UpdateAlertStatusRequest,
  BulkUpdateAlertStatusRequest,
  BulkUpdateAlertStatusResponse,
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
  CampaignOverrideMode,
  CampaignOverridesResponse,
  SetCampaignOverridesRequest,
  InvoiceType,
  type__2,
  InvoiceStatus,
  status__3,
  InvoiceResponse,
  PaginatedResponse_InvoiceResponse_,
  CustomTaxonomyListItem,
  TaxonomyNodeRequest,
  CreateCustomTaxonomyRequest,
  TaxonomyNodeResponse,
  CustomTaxonomyResponse,
  ParseTaxonomyTextRequest,
  ParsedTaxonomyNode,
  ParseTaxonomyTextResponse,
  UpdateCustomTaxonomyRequest,
  TagMatchMode,
};
