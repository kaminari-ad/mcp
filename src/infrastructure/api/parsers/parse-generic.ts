/**
 * Lightweight, defensive parsers reused across many endpoints.
 *
 * Each parser takes `unknown` and either returns `Ok(typed)` or
 * `Err({ kind: "upstream", ... })`. The "defensive subset" style
 * mirrors `parse-scan.ts` / `parse-campaign.ts`: if a non-critical
 * field has the wrong type, default it; if a key field is missing
 * (typically `id`), fail loud.
 *
 * Field names match the API's OpenAPI schema verbatim — see
 * `domain/ports/api-gateway.ts` for the `Pick<>` projections that
 * make TypeScript enforce this at compile time.
 */

import type {
  AlertNotificationDestinationResponse,
  AlertStatsResponse,
  ApiError,
  ApiKeyCreatedResponse,
  BalanceTransactionResponse,
  BulkReplayResponse,
  CampaignOverridesResponse,
  DeliveryAttemptResponse,
  EventCatalogEntryResponse,
  EventCatalogResponse,
  GroupActionResponse,
  InvoiceResponse,
  PaginatedResponse,
  PolicyEntryResponse,
  RoleResponse,
  RuleTestResponse,
  ScanTagResponse,
  TagDefinitionDetailResponse,
  UsagePeriodSummaryResponse,
  UsageResponse,
  UserResponse,
} from "../../../domain/ports/api-gateway.js";
import { err, ok, type Result } from "../../../shared/result.js";
import { isStringRecord } from "./shared.js";

function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function n(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}
function b(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function sOrNull(v: unknown): string | null {
  if (v === null) return null;
  return typeof v === "string" ? v : null;
}
function nOrNull(v: unknown): number | null {
  if (v === null) return null;
  return typeof v === "number" ? v : null;
}
function strArr(v: unknown): readonly string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

/** Generic page envelope parser. */
export function parsePageOf<T>(
  parseItem: (raw: unknown) => Result<T, ApiError>
): (raw: unknown) => Result<PaginatedResponse<T>, ApiError> {
  return (raw) => {
    if (!isStringRecord(raw)) {
      return err({ kind: "upstream", detail: "malformed page envelope" });
    }
    const items = raw["items"];
    const total = raw["total"];
    const page = raw["page"];
    const limit = raw["limit"];
    if (
      !Array.isArray(items) ||
      typeof total !== "number" ||
      typeof page !== "number" ||
      typeof limit !== "number"
    ) {
      return err({ kind: "upstream", detail: "page envelope: wrong field types" });
    }
    const out: T[] = [];
    for (const item of items) {
      const r = parseItem(item);
      if (r.isErr()) return err(r.error);
      out.push(r.value);
    }
    return ok({ items: out, total, page, limit });
  };
}

/** Generic array-of-T parser. */
export function parseArrayOf<T>(
  parseItem: (raw: unknown) => Result<T, ApiError>
): (raw: unknown) => Result<readonly T[], ApiError> {
  return (raw) => {
    if (!Array.isArray(raw)) return err({ kind: "upstream", detail: "expected array" });
    const out: T[] = [];
    for (const item of raw) {
      const r = parseItem(item);
      if (r.isErr()) return err(r.error);
      out.push(r.value);
    }
    return ok(out);
  };
}

// ── Per-DTO parsers ──────────────────────────────────────────────

function withId<T>(
  raw: unknown,
  label: string,
  build: (r: Record<string, unknown>, id: string) => T
): Result<T, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: `malformed ${label}` });
  const id = raw["id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: `${label}: id required` });
  return ok(build(raw, id));
}

/** `GET /api/v1/account` returns `OrgResponse`. */
export function parseOrg(raw: unknown): Result<
  {
    readonly id: string;
    readonly name: string;
    readonly owner_id: string;
    readonly is_active: boolean;
    readonly created_at: string;
  },
  ApiError
> {
  return withId(raw, "org", (r, id) => ({
    id,
    name: s(r["name"]),
    owner_id: s(r["owner_id"]),
    is_active: b(r["is_active"], true),
    created_at: s(r["created_at"]),
  }));
}

/**
 *
 */
export function parseUser(raw: unknown): Result<UserResponse, ApiError> {
  return withId(raw, "user", (r, id) => ({
    id,
    email: s(r["email"]),
    name: s(r["name"]),
    role_name: s(r["role_name"]),
    is_active: b(r["is_active"], true),
    created_at: s(r["created_at"]),
  }));
}

/**
 *
 */
export function parseRole(raw: unknown): Result<RoleResponse, ApiError> {
  return withId(raw, "role", (r, id) => ({
    id,
    name: s(r["name"]),
    scope: s(r["scope"], "organization"),
    is_system: b(r["is_system"]),
    permissions: [...strArr(r["permissions"])],
  }));
}

/**
 *
 */
export function parseApiKeyCreated(raw: unknown): Result<ApiKeyCreatedResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed api-key-created" });
  const id = raw["id"];
  const fullKey = raw["full_key"];
  if (typeof id !== "string" || typeof fullKey !== "string") {
    return err({ kind: "upstream", detail: "api-key-created: id + full_key required" });
  }
  return ok({
    id,
    key_prefix: s(raw["key_prefix"]),
    name: s(raw["name"]),
    expires_at: sOrNull(raw["expires_at"]),
    created_at: s(raw["created_at"]),
    full_key: fullKey,
  });
}

/**
 *
 */
export function parseScanTag(raw: unknown): Result<ScanTagResponse, ApiError> {
  return withId(raw, "scan-tag", (r, id) => ({
    id,
    scan_id: s(r["scan_id"]),
    tag_slug: s(r["tag_slug"]),
    detail: s(r["detail"]),
    url: s(r["url"]),
    display_name: s(r["display_name"]),
    category: s(r["category"]),
    severity: s(r["severity"]),
    created_at: s(r["created_at"]),
  }));
}

/**
 *
 */
export function parseTagDetail(raw: unknown): Result<TagDefinitionDetailResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed tag detail" });
  const slug = raw["slug"];
  if (typeof slug !== "string") return err({ kind: "upstream", detail: "tag: slug required" });
  return ok({
    slug,
    category: s(raw["category"]),
    source: s(raw["source"]),
    display_name: s(raw["display_name"]),
    description: s(raw["description"]),
    severity: s(raw["severity"]),
    is_system: b(raw["is_system"]),
    organization_id: sOrNull(raw["organization_id"]),
    show_in_public_report: b(raw["show_in_public_report"]),
    scans_count: n(raw["scans_count"]),
    rules_count: n(raw["rules_count"]),
  });
}

/**
 *
 */
export function parseRuleTest(raw: unknown): Result<RuleTestResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed rule-test" });
  const tagsRaw = raw["tags"];
  const tags: { tag_slug: string; detail?: string | null }[] = [];
  if (Array.isArray(tagsRaw)) {
    for (const t of tagsRaw) {
      if (!isStringRecord(t)) continue;
      const slug = t["tag_slug"];
      if (typeof slug !== "string") continue;
      const detail = t["detail"];
      tags.push({
        tag_slug: slug,
        detail: typeof detail === "string" || detail === null ? detail : null,
      });
    }
  }
  return ok({ matched: b(raw["matched"]), elapsed_ms: n(raw["elapsed_ms"]), tags });
}

/**
 *
 */
export function parseAlertStats(raw: unknown): Result<AlertStatsResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed alert-stats" });
  return ok({
    open: n(raw["open"]),
    acknowledged: n(raw["acknowledged"]),
    resolved: n(raw["resolved"]),
    dismissed: n(raw["dismissed"]),
  });
}

/**
 *
 */
export function parseUsage(raw: unknown): Result<UsageResponse, ApiError> {
  return withId(raw, "usage", (r, id) => ({
    id,
    scan_id: s(r["scan_id"]),
    charged_micros: n(r["charged_micros"]),
    balance_after_micros: n(r["balance_after_micros"]),
    within_plan: b(r["within_plan"]),
    event_type: s(r["event_type"], "scan"),
    created_at: s(r["created_at"]),
  }));
}

/**
 *
 */
export function parseUsageSummary(raw: unknown): Result<UsagePeriodSummaryResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed usage-summary" });
  return ok({
    period_start: s(raw["period_start"]),
    period_end: s(raw["period_end"]),
    checks: n(raw["checks"]),
    rechecks: n(raw["rechecks"]),
    within_plan: n(raw["within_plan"]),
    overage: n(raw["overage"]),
    charged_micros: n(raw["charged_micros"]),
  });
}

/**
 *
 */
export function parseBalanceTx(raw: unknown): Result<BalanceTransactionResponse, ApiError> {
  return withId(raw, "balance-tx", (r, id) => ({
    id,
    type: s(r["type"]),
    amount_micros: n(r["amount_micros"]),
    balance_after_micros: n(r["balance_after_micros"]),
    description: s(r["description"]),
    reference_kind: sOrNull(r["reference_kind"]),
    reference_id: sOrNull(r["reference_id"]),
    actor_user_id: sOrNull(r["actor_user_id"]),
    created_at: s(r["created_at"]),
  }));
}

/**
 *
 */
export function parseInvoice(raw: unknown): Result<InvoiceResponse, ApiError> {
  return withId(raw, "invoice", (r, id) => ({
    id,
    number: s(r["number"]),
    type: s(r["type"], "final"),
    status: s(r["status"], "draft"),
    total_micros: n(r["total_micros"]),
    currency: s(r["currency"]),
    period_start: sOrNull(r["period_start"]),
    period_end: sOrNull(r["period_end"]),
    issued_at: sOrNull(r["issued_at"]),
    paid_at: sOrNull(r["paid_at"]),
    voided_at: sOrNull(r["voided_at"]),
    has_pdf: b(r["has_pdf"]),
    description: s(r["description"]),
    payment_method: s(r["payment_method"]),
    created_at: s(r["created_at"]),
  }));
}

/**
 *
 */
export function parseWebhookDelivery(raw: unknown): Result<DeliveryAttemptResponse, ApiError> {
  return withId(raw, "webhook-delivery", (r, id) => ({
    id,
    event_id: s(r["event_id"]),
    event_type: s(r["event_type"]),
    response_status: nOrNull(r["response_status"]),
    success: b(r["success"]),
    attempt_number: n(r["attempt_number"]),
    error_code: sOrNull(r["error_code"]),
    elapsed_ms: n(r["elapsed_ms"]),
    created_at: s(r["created_at"]),
  }));
}

/**
 *
 */
export function parseEventCatalog(raw: unknown): Result<EventCatalogResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed event-catalog response" });
  }
  const entries = raw["entries"];
  if (!Array.isArray(entries)) {
    return err({ kind: "upstream", detail: "event-catalog: entries must be array" });
  }
  const out: EventCatalogEntryResponse[] = [];
  for (const item of entries) {
    if (!isStringRecord(item)) {
      return err({ kind: "upstream", detail: "malformed event-catalog entry" });
    }
    const type = item["event_type"];
    if (typeof type !== "string") {
      return err({ kind: "upstream", detail: "event-catalog entry: event_type required" });
    }
    out.push({ event_type: type, description: s(item["description"]) });
  }
  return ok({ entries: out });
}

/**
 *
 */
export function parseAlertDestination(
  raw: unknown
): Result<AlertNotificationDestinationResponse, ApiError> {
  return withId(raw, "alert-destination", (r, id) => ({
    id,
    channel: s(r["channel"]),
    name: s(r["name"]),
    is_active: b(r["is_active"], true),
    is_default_target: b(r["is_default_target"]),
    version: s(r["version"], "public") === "internal" ? "internal" : "public",
    consecutive_failures: n(r["consecutive_failures"]),
    last_delivery_at: sOrNull(r["last_delivery_at"]),
    last_delivery_status: nOrNull(r["last_delivery_status"]),
    slack_workspace_id: sOrNull(r["slack_workspace_id"]),
    slack_channel_name: sOrNull(r["slack_channel_name"]),
    telegram_chat_title: sOrNull(r["telegram_chat_title"]),
    telegram_chat_type: sOrNull(r["telegram_chat_type"]),
    email_address: sOrNull(r["email_address"]),
    included_label_keys: [...strArr(r["included_label_keys"])],
    created_at: s(r["created_at"]),
    updated_at: s(r["updated_at"]),
  }));
}

/**
 *
 */
export function parseCampaignAlertOverrides(
  raw: unknown
): Result<CampaignOverridesResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed campaign-overrides" });
  }
  const cid = raw["campaign_id"];
  if (typeof cid !== "string") {
    return err({ kind: "upstream", detail: "campaign-overrides: campaign_id required" });
  }
  return ok({
    campaign_id: cid,
    mode: s(raw["mode"], "inherit"),
    destination_ids: [...strArr(raw["destination_ids"])],
  });
}

/**
 *
 */
export function parseBulkReplay(raw: unknown): Result<BulkReplayResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed bulk-replay response" });
  }
  return ok({
    replayed: n(raw["replayed"]),
    skipped: n(raw["skipped"]),
  });
}

/**
 *
 */
export function parseGroupAction(raw: unknown): Result<GroupActionResponse, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed group-action" });
  }
  const groupId = raw["group_id"];
  if (typeof groupId !== "string") {
    return err({ kind: "upstream", detail: "group-action: group_id required" });
  }
  // GroupActionResponse.failures items are typed loosely on the port —
  // we forward them verbatim (the API ships `{campaign_id, error_code,
  // detail}` objects but new fields may appear without breaking us).
  const failures: readonly unknown[] = Array.isArray(raw["failures"]) ? raw["failures"] : [];
  return ok({
    group_id: groupId,
    affected_campaigns: n(raw["affected_campaigns"]),
    cancelled_count: n(raw["cancelled_count"]),
    run_ids: [...strArr(raw["run_ids"])],
    failures,
  });
}

/**
 *
 */
export function parsePolicyEntry(raw: unknown): Result<PolicyEntryResponse, ApiError> {
  return withId(raw, "policy-entry", (r, id) => ({
    id,
    tag_slug: s(r["tag_slug"]),
    country_codes: [...strArr(r["country_codes"])],
  }));
}
