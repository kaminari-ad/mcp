/**
 * Coverage for `parse-generic.ts`. One describe block per parser; each
 * exercises happy + the main error branches so the overall file hits
 * 100% line/statement and ≥95% branch.
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
  parseTagDetail,
  parseUsage,
  parseUsageSummary,
  parseUser,
  parseWebhookDelivery,
} from "../../../../../src/infrastructure/api/parsers/parse-generic.js";
import { err, ok, type Result } from "../../../../../src/shared/result.js";

describe("parsePageOf", () => {
  const inner = (raw: unknown): Result<{ id: string }, ApiError> => {
    if (
      typeof raw === "object" &&
      raw !== null &&
      "id" in raw &&
      typeof (raw as { id: unknown }).id === "string"
    ) {
      return ok({ id: (raw as { id: string }).id });
    }
    return err({ kind: "upstream", detail: "bad" });
  };
  it("Ok valid envelope", () => {
    const parse = parsePageOf(inner);
    const r = parse({ items: [{ id: "x" }], total: 1, page: 1, limit: 50 });
    expect(r.isOk()).toBe(true);
  });
  it("rejects non-object", () => {
    expect(parsePageOf(inner)("x").isErr()).toBe(true);
  });
  it("rejects bad envelope shape", () => {
    expect(parsePageOf(inner)({ items: "x", total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
  });
  it("rejects when item parse fails", () => {
    expect(parsePageOf(inner)({ items: [{}], total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
  });
});

describe("parseArrayOf", () => {
  const inner = (raw: unknown): Result<string, ApiError> =>
    typeof raw === "string" ? ok(raw) : err({ kind: "upstream", detail: "bad" });
  it("Ok valid array", () => {
    expect(parseArrayOf(inner)(["a", "b"]).isOk()).toBe(true);
  });
  it("rejects non-array", () => {
    expect(parseArrayOf(inner)({}).isErr()).toBe(true);
  });
  it("rejects when item parse fails", () => {
    expect(parseArrayOf(inner)(["a", 1]).isErr()).toBe(true);
  });
});

describe("withId-based parsers", () => {
  it("parseOrg Ok / Err", () => {
    expect(
      parseOrg({
        id: "o1",
        name: "X",
        owner_id: "u1",
        is_active: true,
        created_at: "t",
      }).isOk()
    ).toBe(true);
    expect(parseOrg("x").isErr()).toBe(true);
    expect(parseOrg({ name: "no id" }).isErr()).toBe(true);
  });
  it("parseUser defensive defaults", () => {
    const r = parseUser({ id: "u1", email: 42 });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().email).toBe("");
  });
  it("parseRole on a realistic API payload", () => {
    const r = parseRole({
      id: "00000000-0000-0000-0000-000000000033",
      name: "admin",
      scope: "organization",
      is_system: false,
      permissions: ["scans.read", "scans.write", "billing.read"],
    });
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.scope).toBe("organization");
    expect(v.permissions).toEqual(["scans.read", "scans.write", "billing.read"]);
  });
  it("parseRole filters non-string permissions and defaults scope", () => {
    const r = parseRole({ id: "r1", permissions: ["a", 1, "b"] });
    expect(r._unsafeUnwrap().permissions).toEqual(["a", "b"]);
    expect(r._unsafeUnwrap().scope).toBe("organization");
  });
  it("parseApiKeyCreated Ok / requires full_key", () => {
    expect(parseApiKeyCreated({ id: "k1", full_key: "secret" }).isOk()).toBe(true);
    expect(parseApiKeyCreated({ id: "k1" }).isErr()).toBe(true);
    expect(parseApiKeyCreated("x").isErr()).toBe(true);
  });
  it("parseTagDetail Ok / Err / null org id", () => {
    expect(parseTagDetail({ slug: "x", organization_id: null }).isOk()).toBe(true);
    expect(parseTagDetail({}).isErr()).toBe(true);
    expect(parseTagDetail("x").isErr()).toBe(true);
  });
  it("parseScanTag Ok / Err", () => {
    expect(parseScanTag({ id: "s1", scan_id: "scan-1", tag_slug: "x" }).isOk()).toBe(true);
    expect(parseScanTag({}).isErr()).toBe(true);
    expect(parseScanTag("x").isErr()).toBe(true);
  });
  it("parseUsage on a realistic API row", () => {
    const r = parseUsage({
      id: "00000000-0000-0000-0000-000000000444",
      scan_id: "00000000-0000-0000-0000-000000000aaa",
      charged_micros: 250,
      balance_after_micros: 49_750,
      within_plan: false,
      event_type: "recheck",
      created_at: "2026-05-16T12:00:00Z",
    });
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.charged_micros).toBe(250);
    expect(v.balance_after_micros).toBe(49_750);
    expect(v.within_plan).toBe(false);
    expect(v.event_type).toBe("recheck");
  });
  it("parseUsage with skeleton input falls back to defaults", () => {
    const r = parseUsage({ id: "x" });
    expect(r._unsafeUnwrap().event_type).toBe("scan");
    expect(r._unsafeUnwrap().charged_micros).toBe(0);
  });
  it("parseBalanceTx on a realistic API row", () => {
    const r = parseBalanceTx({
      id: "00000000-0000-0000-0000-000000000555",
      type: "usage_charge",
      amount_micros: -250,
      balance_after_micros: 49_750,
      description: "Scan charge",
      reference_kind: "scan",
      reference_id: "00000000-0000-0000-0000-000000000aaa",
      actor_user_id: null,
      created_at: "2026-05-16T12:00:00Z",
    });
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.type).toBe("usage_charge");
    expect(v.amount_micros).toBe(-250);
    expect(v.reference_kind).toBe("scan");
    expect(v.actor_user_id).toBeNull();
  });
  it("parseBalanceTx with skeleton input falls back to defaults", () => {
    const r = parseBalanceTx({ id: "x" });
    expect(r._unsafeUnwrap().amount_micros).toBe(0);
  });
  it("parseInvoice Ok / null paid_at coercion", () => {
    const r = parseInvoice({ id: "x", paid_at: 5 });
    expect(r._unsafeUnwrap().paid_at).toBeNull();
  });
  it("parseWebhookDelivery Ok / null response_status", () => {
    const r = parseWebhookDelivery({ id: "x", response_status: null });
    expect(r._unsafeUnwrap().response_status).toBeNull();
  });
  it("parseAlertDestination on a realistic Slack destination", () => {
    const r = parseAlertDestination({
      id: "00000000-0000-0000-0000-000000000999",
      organization_id: "00000000-0000-0000-0000-000000000010",
      channel: "slack",
      name: "Ops alerts",
      is_active: true,
      is_default_target: true,
      version: "internal",
      consecutive_failures: 0,
      last_delivery_at: "2026-05-16T11:59:00Z",
      last_delivery_status: 200,
      slack_workspace_id: "T01234567",
      slack_channel_id: "C09876543",
      slack_channel_name: "ops-alerts",
      telegram_chat_id: null,
      telegram_chat_title: null,
      telegram_chat_type: null,
      email_address: null,
      included_label_keys: ["env", "campaign"],
      created_at: "2026-05-01T00:00:00Z",
      updated_at: "2026-05-16T11:59:00Z",
    });
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.channel).toBe("slack");
    expect(v.is_default_target).toBe(true);
    expect(v.version).toBe("internal");
    expect(v.slack_workspace_id).toBe("T01234567");
    expect(v.slack_channel_name).toBe("ops-alerts");
    expect(v.included_label_keys).toEqual(["env", "campaign"]);
  });
  it("parseAlertDestination on a realistic Telegram destination", () => {
    const r = parseAlertDestination({
      id: "00000000-0000-0000-0000-000000000aaa",
      organization_id: "00000000-0000-0000-0000-000000000010",
      channel: "telegram",
      name: "TG bot",
      is_active: true,
      is_default_target: false,
      version: "public",
      consecutive_failures: 3,
      last_delivery_at: "2026-05-16T11:00:00Z",
      last_delivery_status: 403,
      slack_workspace_id: null,
      slack_channel_id: null,
      slack_channel_name: null,
      telegram_chat_id: "-100123456",
      telegram_chat_title: "Kaminari alerts",
      telegram_chat_type: "supergroup",
      email_address: null,
      included_label_keys: [],
      created_at: "2026-04-01T00:00:00Z",
      updated_at: "2026-05-16T11:00:00Z",
    });
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.channel).toBe("telegram");
    expect(v.telegram_chat_title).toBe("Kaminari alerts");
    expect(v.telegram_chat_type).toBe("supergroup");
    expect(v.consecutive_failures).toBe(3);
    expect(v.last_delivery_status).toBe(403);
  });
  it("parseAlertDestination with skeleton input falls back to defaults", () => {
    const r = parseAlertDestination({ id: "x" });
    expect(r._unsafeUnwrap().channel).toBe("");
    expect(r._unsafeUnwrap().version).toBe("public");
  });
  it("parsePolicyEntry Ok", () => {
    expect(parsePolicyEntry({ id: "e1", tag_slug: "x", country_codes: ["US"] }).isOk()).toBe(true);
  });
});

describe("standalone parsers", () => {
  it("parseRuleTest Ok with defaults", () => {
    const r = parseRuleTest({});
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().matched).toBe(false);
    expect(parseRuleTest("x").isErr()).toBe(true);
  });
  it("parseRuleTest collects tag results", () => {
    const r = parseRuleTest({
      matched: true,
      elapsed_ms: 7,
      tags: [
        { tag_slug: "malware", detail: "matched on .exe" },
        { tag_slug: "phishing", detail: null },
        { tag_slug: 42 },
        { not_an_obj: true },
        "not-an-object-at-all",
      ],
    });
    expect(r._unsafeUnwrap().tags).toEqual([
      { tag_slug: "malware", detail: "matched on .exe" },
      { tag_slug: "phishing", detail: null },
    ]);
  });
  it("parseAlertStats Ok", () => {
    expect(parseAlertStats({ open: 1 }).isOk()).toBe(true);
    expect(parseAlertStats("x").isErr()).toBe(true);
  });
  it("parseUsageSummary Ok / Err", () => {
    expect(parseUsageSummary({}).isOk()).toBe(true);
    expect(parseUsageSummary("x").isErr()).toBe(true);
  });
  it("parseEventCatalog Ok / Err shapes", () => {
    expect(
      parseEventCatalog({
        entries: [{ event_type: "scan.done", description: "" }],
      }).isOk()
    ).toBe(true);
    expect(parseEventCatalog("x").isErr()).toBe(true);
    expect(parseEventCatalog({ entries: "x" }).isErr()).toBe(true);
    expect(parseEventCatalog({ entries: ["x"] }).isErr()).toBe(true);
    expect(parseEventCatalog({ entries: [{ noType: "x" }] }).isErr()).toBe(true);
  });
  it("parseCampaignAlertOverrides Ok / Err / mode normalization", () => {
    const r = parseCampaignAlertOverrides({
      campaign_id: "c1",
      mode: "include",
      destination_ids: ["d1"],
    });
    expect(r._unsafeUnwrap().mode).toBe("include");
    expect(parseCampaignAlertOverrides({ campaign_id: "c1" })._unsafeUnwrap().mode).toBe("inherit");
    expect(parseCampaignAlertOverrides("x").isErr()).toBe(true);
    expect(parseCampaignAlertOverrides({}).isErr()).toBe(true);
  });
  it("parseBulkReplay Ok / Err", () => {
    expect(parseBulkReplay({ replayed: 5, skipped: 1 }).isOk()).toBe(true);
    expect(parseBulkReplay("x").isErr()).toBe(true);
  });
  it("parseGroupAction Ok / Err", () => {
    const r = parseGroupAction({
      group_id: "g1",
      affected_campaigns: 3,
      cancelled_count: 0,
      run_ids: ["r1", "r2"],
      failures: [{ campaign_id: "c1", error_code: "X", detail: "boom" }],
    });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().run_ids).toEqual(["r1", "r2"]);
    expect(r._unsafeUnwrap().failures.length).toBe(1);
    expect(parseGroupAction("x").isErr()).toBe(true);
    expect(parseGroupAction({}).isErr()).toBe(true);
  });
});
