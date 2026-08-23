/**
 * Coverage for `parse-generic.ts`. Post Phase 2b each per-DTO parser
 * is a one-liner over `parseWithSchema(schemas.X.pick({...}).strip())`;
 * fixtures must be schema-valid (UUIDs, ISO datetimes, enum values).
 *
 * Tests focus on:
 *   - happy path (valid OpenAPI-shaped payload)
 *   - the typed `upstream` error path (missing required, wrong type)
 *   - the `null` paths for nullable optional fields
 *
 * The exhaustive list of helpers + paginated-envelope semantics is
 * covered in `parse-with-schema.test.ts`. Here we only assert that
 * each per-DTO parser is wired to the right schema and returns the
 * expected `Result` shape.
 */

import { describe, expect, it } from "vitest";

import type { ApiError } from "../../../../../src/domain/ports/api-gateway.js";
import {
  parseAlertDestination,
  parseAlertStats,
  parseApiKeyCreated,
  parseArrayOf,
  parseBalanceTx,
  parseBulkReplay,
  parseBulkUpdateAlertStatus,
  parseCampaignAlertOverrides,
  parseEventCatalog,
  parseGroupAction,
  parseInvoice,
  parseOrg,
  parsePageOf,
  parsePolicyEntry,
  parseRole,
  parseRuleTest,
  parseScanTag,
  parseUsage,
  parseUsageSummary,
  parseUser,
  parseWebhookDelivery,
} from "../../../../../src/infrastructure/api/parsers/parse-generic.js";
import { err, ok, type Result } from "../../../../../src/shared/result.js";

// Stable UUIDs / ISO datetimes used across the file so each parser
// has a canonical "this is valid" sample.
const UUID_A = "00000000-0000-0000-0000-000000000001";
const UUID_B = "00000000-0000-0000-0000-000000000002";
const UUID_C = "00000000-0000-0000-0000-000000000003";
const TS = "2026-05-17T12:00:00Z";

describe("parsePageOf", () => {
  const inner = (raw: unknown): Result<{ id: string }, ApiError> => {
    if (typeof raw === "object" && raw !== null && "id" in raw && typeof raw.id === "string") {
      return ok({ id: (raw as { id: string }).id });
    }
    return err({ kind: "upstream", detail: "bad" });
  };
  it("Ok valid envelope", () => {
    const r = parsePageOf(inner)({ items: [{ id: "x" }], total: 1, page: 1, limit: 50 });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ items: [{ id: "x" }], total: 1, page: 1, limit: 50 });
  });
  it("rejects non-object", () => {
    expect(parsePageOf(inner)("x").isErr()).toBe(true);
  });
  it("rejects bad envelope shape (wrong types)", () => {
    expect(parsePageOf(inner)({ items: "x", total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
    expect(parsePageOf(inner)({ items: [], total: "1", page: 1, limit: 50 }).isErr()).toBe(true);
  });
  it("rejects when an item parse fails", () => {
    expect(parsePageOf(inner)({ items: [{}], total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
  });
});

describe("parseArrayOf", () => {
  const inner = (raw: unknown): Result<{ id: string }, ApiError> =>
    typeof raw === "object" && raw !== null && "id" in raw
      ? ok({ id: String(raw.id) })
      : err({ kind: "upstream", detail: "x" });
  it("Ok valid array", () => {
    const r = parseArrayOf(inner)([{ id: "a" }, { id: "b" }]);
    expect(r._unsafeUnwrap()).toEqual([{ id: "a" }, { id: "b" }]);
  });
  it("rejects non-array", () => {
    expect(parseArrayOf(inner)({}).isErr()).toBe(true);
  });
  it("rejects when an item parse fails", () => {
    expect(parseArrayOf(inner)([{}]).isErr()).toBe(true);
  });
});

// ── Per-DTO parsers ──────────────────────────────────────────────

describe("parseOrg", () => {
  it("Ok valid", () => {
    const r = parseOrg({
      id: UUID_A,
      name: "Acme",
      owner_id: UUID_B,
      is_active: true,
      created_at: TS,
    });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().name).toBe("Acme");
  });
  it("rejects on non-UUID id", () => {
    const r = parseOrg({
      id: "not-uuid",
      name: "x",
      owner_id: UUID_B,
      is_active: true,
      created_at: TS,
    });
    expect(r.isErr()).toBe(true);
    expect(r._unsafeUnwrapErr().detail).toContain("malformed org");
  });
  it("rejects on missing required field", () => {
    const r = parseOrg({ id: UUID_A, owner_id: UUID_B, is_active: true, created_at: TS });
    expect(r.isErr()).toBe(true);
  });
});

describe("parseUser", () => {
  it("Ok valid + surfaces role_id", () => {
    const r = parseUser({
      id: UUID_A,
      email: "alice@example.com",
      name: "Alice",
      role_id: UUID_B,
      role_name: "owner",
      is_active: true,
      created_at: TS,
    });
    expect(r._unsafeUnwrap().email).toBe("alice@example.com");
    expect(r._unsafeUnwrap().role_id).toBe(UUID_B);
  });
  it("rejects on missing required field (role_id)", () => {
    const r = parseUser({
      id: UUID_A,
      email: "alice@example.com",
      name: "Alice",
      role_name: "owner",
      is_active: true,
      created_at: TS,
    });
    expect(r.isErr()).toBe(true);
  });
});

describe("parseRole", () => {
  it("Ok valid", () => {
    const r = parseRole({
      id: UUID_A,
      name: "owner",
      scope: "organization",
      is_system: true,
      permissions: ["scans.read", "scans.write"],
    });
    expect(r._unsafeUnwrap().permissions).toEqual(["scans.read", "scans.write"]);
  });
  it("rejects on non-string permissions array entry", () => {
    const r = parseRole({
      id: UUID_A,
      name: "owner",
      scope: "organization",
      is_system: true,
      permissions: ["scans.read", 42],
    });
    expect(r.isErr()).toBe(true);
  });
});

describe("parseApiKeyCreated", () => {
  it("Ok valid", () => {
    const r = parseApiKeyCreated({
      id: UUID_A,
      key_prefix: "kad_xx",
      full_key: "kad_xxxxxxxxxxxxxx",
      name: "ci-key",
      expires_at: null,
      created_at: TS,
    });
    expect(r._unsafeUnwrap().full_key).toBe("kad_xxxxxxxxxxxxxx");
  });
  it("rejects on missing full_key", () => {
    const r = parseApiKeyCreated({
      id: UUID_A,
      key_prefix: "kad_xx",
      name: "ci-key",
      expires_at: null,
      created_at: TS,
    });
    expect(r.isErr()).toBe(true);
  });
});

describe("parseScanTag", () => {
  const VALID = {
    id: UUID_A,
    scan_id: UUID_B,
    tag_slug: "malware",
    detail: "",
    url: "https://example.com",
    display_name: "Malware",
    category: "security",
    severity: "high",
    created_at: TS,
  };
  it("Ok valid", () => {
    expect(parseScanTag(VALID)._unsafeUnwrap().tag_slug).toBe("malware");
  });
  it("rejects non-uuid id", () => {
    expect(parseScanTag({ ...VALID, id: "not-uuid" }).isErr()).toBe(true);
  });
  it("rejects on missing required (scan_id)", () => {
    const { scan_id: _omit, ...rest } = VALID;
    expect(parseScanTag(rest).isErr()).toBe(true);
  });
});

// `parseTagDetail` moved to `parse-tag.ts` in v0.2.0 (it needs the
// detail schema's `linked_rules` field which the list-row schema
// doesn't have). See `parse-tag.test.ts` for its coverage.

describe("parseRuleTest", () => {
  it("Ok valid", () => {
    const r = parseRuleTest({
      matched: true,
      elapsed_ms: 12,
      tags: [{ tag_slug: "malware", detail: "matched" }],
    });
    expect(r._unsafeUnwrap().matched).toBe(true);
    expect(r._unsafeUnwrap().tags).toHaveLength(1);
  });
  it("Ok with empty tags array", () => {
    const r = parseRuleTest({ matched: false, elapsed_ms: 5, tags: [] });
    expect(r._unsafeUnwrap().tags).toEqual([]);
  });
});

describe("parseAlertStats", () => {
  it("Ok valid", () => {
    const r = parseAlertStats({ open: 3, escalated: 0, resolved: 5, dismissed: 1 });
    expect(r._unsafeUnwrap()).toEqual({ open: 3, escalated: 0, resolved: 5, dismissed: 1 });
  });
  it("rejects on missing field", () => {
    expect(parseAlertStats({ open: 3 }).isErr()).toBe(true);
  });
});

describe("parseBulkUpdateAlertStatus", () => {
  it("Ok valid", () => {
    expect(parseBulkUpdateAlertStatus({ updated: 7, skipped: 2 })._unsafeUnwrap()).toEqual({
      updated: 7,
      skipped: 2,
    });
  });
  it("rejects on missing skipped", () => {
    expect(parseBulkUpdateAlertStatus({ updated: 7 }).isErr()).toBe(true);
  });
  it("rejects a non-object body", () => {
    expect(parseBulkUpdateAlertStatus("nope").isErr()).toBe(true);
  });
});

describe("parseUsage", () => {
  const VALID = {
    id: UUID_A,
    scan_id: UUID_B,
    charged_micros: 1000,
    balance_after_micros: 5000,
    within_plan: true,
    event_type: "scan",
    created_at: TS,
  };
  it("Ok valid", () => {
    expect(parseUsage(VALID)._unsafeUnwrap().event_type).toBe("scan");
  });
  it("rejects wrong type (non-bool within_plan)", () => {
    expect(parseUsage({ ...VALID, within_plan: "yes" }).isErr()).toBe(true);
  });
  it("rejects on missing required (charged_micros)", () => {
    const { charged_micros: _omit, ...rest } = VALID;
    expect(parseUsage(rest).isErr()).toBe(true);
  });
});

describe("parseUsageSummary", () => {
  const VALID = {
    period_start: TS,
    period_end: TS,
    checks: 10,
    rechecks: 2,
    within_plan: 8,
    overage: 4,
    charged_micros: 12000,
  };
  it("Ok valid", () => {
    expect(parseUsageSummary(VALID)._unsafeUnwrap().checks).toBe(10);
  });
  it("rejects on missing required (period_end)", () => {
    const { period_end: _omit, ...rest } = VALID;
    expect(parseUsageSummary(rest).isErr()).toBe(true);
  });
  it("rejects wrong type (non-number checks)", () => {
    expect(parseUsageSummary({ ...VALID, checks: "x" }).isErr()).toBe(true);
  });
});

describe("parseBalanceTx", () => {
  const VALID = {
    id: UUID_A,
    type: "charge",
    amount_micros: -1000,
    balance_after_micros: 9000,
    description: "",
    reference_kind: "scan",
    reference_id: UUID_B,
    actor_user_id: null,
    created_at: TS,
  };
  it("Ok valid", () => {
    expect(parseBalanceTx(VALID)._unsafeUnwrap().type).toBe("charge");
  });
  it("Ok with non-null actor_user_id", () => {
    const r = parseBalanceTx({ ...VALID, actor_user_id: UUID_A });
    expect(r._unsafeUnwrap().actor_user_id).toBe(UUID_A);
  });
  it("rejects on missing required (id)", () => {
    const { id: _omit, ...rest } = VALID;
    expect(parseBalanceTx(rest).isErr()).toBe(true);
  });
});

describe("parseInvoice", () => {
  const VALID = {
    id: UUID_A,
    number: "INV-0001",
    type: "final",
    status: "paid",
    total_micros: 100000,
    currency: "USD",
    period_start: TS,
    period_end: TS,
    issued_at: TS,
    paid_at: TS,
    voided_at: null,
    has_pdf: true,
    description: "",
    payment_method: "card",
    created_at: TS,
  };
  it("Ok valid", () => {
    expect(parseInvoice(VALID)._unsafeUnwrap().paid_at).toBe(TS);
  });
  it("Ok with null paid_at (issued but unpaid)", () => {
    expect(parseInvoice({ ...VALID, paid_at: null }).isOk()).toBe(true);
  });
  it("rejects on missing required (number)", () => {
    const { number: _omit, ...rest } = VALID;
    expect(parseInvoice(rest).isErr()).toBe(true);
  });
});

describe("parseWebhookDelivery", () => {
  it("Ok valid with status", () => {
    const r = parseWebhookDelivery({
      id: UUID_A,
      event_id: UUID_B,
      event_type: "scan.completed",
      response_status: 200,
      success: true,
      attempt_number: 1,
      error_code: null,
      elapsed_ms: 12,
      created_at: TS,
    });
    expect(r._unsafeUnwrap().response_status).toBe(200);
  });
  it("Ok valid with null status + error_code", () => {
    const r = parseWebhookDelivery({
      id: UUID_A,
      event_id: UUID_B,
      event_type: "scan.completed",
      response_status: null,
      success: false,
      attempt_number: 1,
      error_code: "connect",
      elapsed_ms: 5000,
      created_at: TS,
    });
    expect(r._unsafeUnwrap().response_status).toBeNull();
    expect(r._unsafeUnwrap().error_code).toBe("connect");
  });
});

describe("parseEventCatalog", () => {
  it("Ok valid", () => {
    const r = parseEventCatalog({
      entries: [{ event_type: "scan.completed", description: "scan finished", sample_payload: {} }],
    });
    expect(r._unsafeUnwrap().entries).toHaveLength(1);
  });
  it("Ok empty entries", () => {
    expect(parseEventCatalog({ entries: [] })._unsafeUnwrap().entries).toEqual([]);
  });
  it("rejects on missing entries", () => {
    expect(parseEventCatalog({}).isErr()).toBe(true);
  });
});

describe("parseAlertDestination", () => {
  const VALID = {
    id: UUID_A,
    channel: "slack",
    name: "#alerts",
    is_active: true,
    is_default_target: false,
    version: "public",
    consecutive_failures: 0,
    last_delivery_at: TS,
    last_delivery_status: 200,
    slack_workspace_id: UUID_B,
    slack_channel_name: "#alerts",
    telegram_chat_title: null,
    telegram_chat_type: null,
    email_address: null,
    included_label_keys: ["env"],
    created_at: TS,
    updated_at: TS,
  };
  it("Ok valid slack", () => {
    expect(parseAlertDestination(VALID)._unsafeUnwrap().channel).toBe("slack");
  });
  it("rejects on missing required (channel)", () => {
    const { channel: _omit, ...rest } = VALID;
    expect(parseAlertDestination(rest).isErr()).toBe(true);
  });
  it("rejects wrong type (non-bool is_active)", () => {
    expect(parseAlertDestination({ ...VALID, is_active: "true" }).isErr()).toBe(true);
  });
});

describe("parseCampaignAlertOverrides", () => {
  it("Ok valid inherit", () => {
    const r = parseCampaignAlertOverrides({
      campaign_id: UUID_A,
      mode: "inherit",
      destination_ids: [],
    });
    expect(r._unsafeUnwrap().mode).toBe("inherit");
  });
  it("Ok valid override with destinations", () => {
    const r = parseCampaignAlertOverrides({
      campaign_id: UUID_A,
      mode: "override",
      destination_ids: [UUID_B, UUID_C],
    });
    expect(r._unsafeUnwrap().destination_ids).toEqual([UUID_B, UUID_C]);
  });
  it("rejects on missing campaign_id", () => {
    expect(parseCampaignAlertOverrides({ mode: "inherit" }).isErr()).toBe(true);
  });
});

describe("parseBulkReplay", () => {
  it("Ok valid", () => {
    expect(parseBulkReplay({ replayed: 5, skipped: 2 })._unsafeUnwrap()).toEqual({
      replayed: 5,
      skipped: 2,
    });
  });
  it("rejects on missing required (skipped)", () => {
    expect(parseBulkReplay({ replayed: 5 }).isErr()).toBe(true);
  });
  it("rejects non-object", () => {
    expect(parseBulkReplay("nope").isErr()).toBe(true);
  });
});

describe("parseGroupAction", () => {
  it("Ok valid full payload", () => {
    const r = parseGroupAction({
      group_id: UUID_A,
      affected_campaigns: 3,
      cancelled_count: 0,
      run_ids: [UUID_B, UUID_C],
      failures: [{ campaign_id: UUID_B, error_code: "X", detail: "boom" }],
    });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().run_ids).toEqual([UUID_B, UUID_C]);
    expect(r._unsafeUnwrap().failures?.length ?? 0).toBe(1);
  });
  it("Ok with optional fields omitted (no runs / no failures)", () => {
    const r = parseGroupAction({ group_id: UUID_A, affected_campaigns: 0, cancelled_count: 0 });
    expect(r.isOk()).toBe(true);
  });
  it("rejects non-object", () => {
    expect(parseGroupAction("x").isErr()).toBe(true);
    expect(parseGroupAction({}).isErr()).toBe(true);
  });
});

describe("parsePolicyEntry", () => {
  it("Ok valid (tag rule)", () => {
    const r = parsePolicyEntry({
      id: UUID_A,
      rule_type: "tag",
      tag_slug: "malware",
      iab_v3: null,
      brand: null,
      ai_category: null,
      custom_taxonomy: null,
      country_codes: ["US", "DE"],
    });
    expect(r._unsafeUnwrap().country_codes).toEqual(["US", "DE"]);
    expect(r._unsafeUnwrap().rule_type).toBe("tag");
  });
  it("Ok valid (iab_v3 rule)", () => {
    const r = parsePolicyEntry({
      id: UUID_A,
      rule_type: "iab_v3",
      tag_slug: null,
      iab_v3: { tier1: "Sensitive Topics", tier2: null, tier3: null, tier4: null },
      brand: null,
      ai_category: null,
      custom_taxonomy: null,
      country_codes: [],
    });
    expect(r._unsafeUnwrap().rule_type).toBe("iab_v3");
    expect(r._unsafeUnwrap().iab_v3?.tier1).toBe("Sensitive Topics");
  });
  it("rejects on missing id", () => {
    expect(
      parsePolicyEntry({
        rule_type: "tag",
        tag_slug: "malware",
        iab_v3: null,
        brand: null,
        ai_category: null,
        custom_taxonomy: null,
        country_codes: [],
      }).isErr()
    ).toBe(true);
  });
});
