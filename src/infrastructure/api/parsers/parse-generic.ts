/**
 * Lightweight, defensive parsers reused across many endpoints.
 *
 * Each parser takes `unknown` and either returns `Ok(typed)` or
 * `Err({ kind: "upstream", ... })`. The "defensive subset" style
 * mirrors `parse-scan.ts` / `parse-campaign.ts`: if a non-critical
 * field has the wrong type, default it; if a key field is missing,
 * fail loud.
 *
 * Use these for endpoints whose response shape is small + flat. For
 * anything deeper (paginated envelopes with nested DTOs) write a
 * dedicated `parse-<domain>.ts`.
 */

import type {
  AlertNotificationDestination,
  AlertStatsResponse,
  ApiError,
  ApiKeyCreatedResponse,
  ApiKeyResponse,
  ArchiveOrCancelResponse,
  BalanceTransactionResponse,
  CampaignAlertOverrides,
  InvoiceResponse,
  OrgResponse,
  OrgRoleResponse,
  OrgUserResponse,
  PaginatedResponse,
  RunCommandResponse,
  ScanTagResponse,
  TagDefinitionWithDetailResponse,
  TestCustomRuleResponse,
  UsagePeriodSummaryResponse,
  UsageResponse,
  WebhookDeliveryAttemptResponse,
  WebhookEventCatalogEntry,
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
function obj(v: unknown): Readonly<Record<string, unknown>> {
  return isStringRecord(v) ? v : {};
}
function strArr(v: unknown): readonly string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

/**
 * Generic page envelope parser. Takes a single-item parser and
 * applies it to every entry, returning the full envelope with parsed
 * items.
 */
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

// ── Per-DTO parsers ─────────────────────────────────────────────

function withId<T>(raw: unknown, label: string, build: (r: Record<string, unknown>, id: string) => T): Result<T, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: `malformed ${label}` });
  const id = raw["id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: `${label}: id required` });
  return ok(build(raw, id));
}

export function parseOrg(raw: unknown): Result<OrgResponse, ApiError> {
  return withId(raw, "org", (r, id) => ({
    id,
    name: s(r["name"]),
    created_at: s(r["created_at"]),
    settings: obj(r["settings"]),
  }));
}

export function parseOrgUser(raw: unknown): Result<OrgUserResponse, ApiError> {
  return withId(raw, "org-user", (r, id) => ({
    id,
    email: s(r["email"]),
    display_name: s(r["display_name"]),
    role: s(r["role"]),
    is_owner: b(r["is_owner"]),
    created_at: s(r["created_at"]),
  }));
}

export function parseOrgRole(raw: unknown): Result<OrgRoleResponse, ApiError> {
  return withId(raw, "org-role", (r, id) => ({
    id,
    name: s(r["name"]),
    is_system: b(r["is_system"]),
    permissions: strArr(r["permissions"]),
  }));
}

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

export function parseApiKey(raw: unknown): Result<ApiKeyResponse, ApiError> {
  return withId(raw, "api-key", (r, id) => ({
    id,
    key_prefix: s(r["key_prefix"]),
    name: s(r["name"]),
    expires_at: sOrNull(r["expires_at"]),
    created_at: s(r["created_at"]),
  }));
}

export function parseRunCommand(raw: unknown): Result<RunCommandResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed run-command" });
  const id = raw["run_id"];
  if (typeof id !== "string") return err({ kind: "upstream", detail: "run-command: run_id required" });
  return ok({ run_id: id });
}

export function parseArchiveOrCancel(raw: unknown): Result<ArchiveOrCancelResponse, ApiError> {
  return withId(raw, "archive-cancel", (r, id) => ({
    id,
    affected_count: n(r["affected_count"]),
  }));
}

export function parseTagDetail(raw: unknown): Result<TagDefinitionWithDetailResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed tag detail" });
  const slug = raw["slug"];
  if (typeof slug !== "string") return err({ kind: "upstream", detail: "tag: slug required" });
  return ok({
    slug,
    category: s(raw["category"]),
    source: s(raw["source"]),
    display_name: s(raw["display_name"]),
    description: s(raw["description"]),
    is_system: b(raw["is_system"]),
    severity: s(raw["severity"]),
    scans_count: n(raw["scans_count"]),
    rules_count: n(raw["rules_count"]),
    organization_id: sOrNull(raw["organization_id"]),
    show_in_public_report: b(raw["show_in_public_report"]),
  });
}

export function parseScanTag(raw: unknown): Result<ScanTagResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed scan-tag" });
  const slug = raw["slug"];
  if (typeof slug !== "string") return err({ kind: "upstream", detail: "scan-tag: slug required" });
  return ok({
    slug,
    display_name: s(raw["display_name"]),
    category: s(raw["category"]),
    severity: s(raw["severity"]),
    source: s(raw["source"]),
  });
}

export function parseTestRule(raw: unknown): Result<TestCustomRuleResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed test-rule" });
  return ok({ matched: b(raw["matched"]), details: obj(raw["details"]) });
}

export function parseAlertStats(raw: unknown): Result<AlertStatsResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed alert-stats" });
  return ok({
    open: n(raw["open"]),
    ack: n(raw["ack"]),
    resolved: n(raw["resolved"]),
    ignored: n(raw["ignored"]),
    total: n(raw["total"]),
  });
}

export function parseUsage(raw: unknown): Result<UsageResponse, ApiError> {
  return withId(raw, "usage", (r, id) => ({
    id,
    scan_id: s(r["scan_id"]),
    cost_micros: n(r["cost_micros"]),
    kind: s(r["kind"]),
    created_at: s(r["created_at"]),
  }));
}

export function parseUsageSummary(raw: unknown): Result<UsagePeriodSummaryResponse, ApiError> {
  if (!isStringRecord(raw)) return err({ kind: "upstream", detail: "malformed usage-summary" });
  return ok({
    total_micros: n(raw["total_micros"]),
    checks_count: n(raw["checks_count"]),
    period_start: sOrNull(raw["period_start"]),
    period_end: sOrNull(raw["period_end"]),
  });
}

export function parseBalanceTx(raw: unknown): Result<BalanceTransactionResponse, ApiError> {
  return withId(raw, "balance-tx", (r, id) => ({
    id,
    type: s(r["type"]),
    amount_micros: n(r["amount_micros"]),
    description: s(r["description"]),
    created_at: s(r["created_at"]),
  }));
}

export function parseInvoice(raw: unknown): Result<InvoiceResponse, ApiError> {
  return withId(raw, "invoice", (r, id) => ({
    id,
    number: s(r["number"]),
    status: s(r["status"]),
    total_micros: n(r["total_micros"]),
    currency: s(r["currency"]),
    issued_at: s(r["issued_at"]),
    due_at: sOrNull(r["due_at"]),
    paid_at: sOrNull(r["paid_at"]),
  }));
}

export function parseWebhookDelivery(
  raw: unknown
): Result<WebhookDeliveryAttemptResponse, ApiError> {
  return withId(raw, "webhook-delivery", (r, id) => ({
    id,
    endpoint_id: s(r["endpoint_id"]),
    event_type: s(r["event_type"]),
    status: s(r["status"]),
    response_status: nOrNull(r["response_status"]),
    attempted_at: s(r["attempted_at"]),
  }));
}

export function parseWebhookEventCatalog(
  raw: unknown
): Result<readonly WebhookEventCatalogEntry[], ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed event-catalog response" });
  }
  const types = raw["types"];
  if (!Array.isArray(types)) {
    return err({ kind: "upstream", detail: "event-catalog: types must be array" });
  }
  const out: WebhookEventCatalogEntry[] = [];
  for (const item of types) {
    if (!isStringRecord(item)) {
      return err({ kind: "upstream", detail: "malformed event-catalog item" });
    }
    const type = item["type"];
    if (typeof type !== "string") {
      return err({ kind: "upstream", detail: "event-catalog item: type required" });
    }
    out.push({ type, description: s(item["description"]) });
  }
  return ok(out);
}

export function parseAlertDestination(
  raw: unknown
): Result<AlertNotificationDestination, ApiError> {
  return withId(raw, "alert-destination", (r, id) => ({
    id,
    kind: s(r["kind"]),
    name: s(r["name"]),
    version: n(r["version"]),
    created_at: s(r["created_at"]),
  }));
}

export function parseCampaignAlertOverrides(
  raw: unknown
): Result<CampaignAlertOverrides, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed campaign-overrides" });
  }
  const cid = raw["campaign_id"];
  if (typeof cid !== "string") {
    return err({ kind: "upstream", detail: "campaign-overrides: campaign_id required" });
  }
  return ok({
    campaign_id: cid,
    destination_ids: strArr(raw["destination_ids"]),
    muted: b(raw["muted"]),
  });
}

export function parseReplayResponse(
  raw: unknown
): Result<{ readonly replayed_count: number }, ApiError> {
  if (!isStringRecord(raw)) {
    return err({ kind: "upstream", detail: "malformed replay response" });
  }
  const count = raw["replayed_count"];
  if (typeof count !== "number") {
    return err({ kind: "upstream", detail: "replay: replayed_count required" });
  }
  return ok({ replayed_count: count });
}
