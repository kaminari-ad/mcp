/**
 * Consolidated tests for the simpler per-domain parsers
 * (one batch covers emulator / tag / custom-rule / alert / webhook /
 * billing-summary / api-key / empty). Each parser owns a focused
 * description block; assertions cover happy path + the main error
 * branches so coverage stays at 100%.
 */

import { describe, expect, it } from "vitest";

import {
  parseAlert,
  parseAlertPage,
} from "../../../../../src/infrastructure/api/parsers/parse-alert.js";
import { parseApiKeyList } from "../../../../../src/infrastructure/api/parsers/parse-api-key.js";
import { parseBillingSummary } from "../../../../../src/infrastructure/api/parsers/parse-billing-summary.js";
import {
  parseCustomRule,
  parseCustomRuleArray,
} from "../../../../../src/infrastructure/api/parsers/parse-custom-rule.js";
import { parseEmpty } from "../../../../../src/infrastructure/api/parsers/parse-empty.js";
import { parseEmulatorList } from "../../../../../src/infrastructure/api/parsers/parse-emulator.js";
import {
  parseTag,
  parseTagDefinitionArray,
} from "../../../../../src/infrastructure/api/parsers/parse-tag.js";
import {
  parseWebhook,
  parseWebhookCreated,
  parseWebhookList,
} from "../../../../../src/infrastructure/api/parsers/parse-webhook.js";

describe("parseEmpty", () => {
  it("always returns Ok(null)", () => {
    const r = parseEmpty(undefined);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toBeNull();
  });
});

describe("parseEmulatorList", () => {
  const VALID = { id: "x", display_name: "X", category: "desktop", browser: "chrome" };
  it("Ok valid array", () => {
    expect(parseEmulatorList([VALID]).isOk()).toBe(true);
  });
  it("rejects non-array", () => {
    expect(parseEmulatorList({}).isErr()).toBe(true);
  });
  it("rejects non-object item", () => {
    expect(parseEmulatorList(["x"]).isErr()).toBe(true);
  });
  it("rejects wrong field type", () => {
    expect(parseEmulatorList([{ ...VALID, browser: 42 }]).isErr()).toBe(true);
  });
});

describe("parseTag / parseTagDefinitionArray", () => {
  const VALID = {
    slug: "x",
    category: "c",
    source: "system",
    display_name: "X",
    description: "",
    is_system: true,
    organization_id: null,
    show_in_public_report: false,
    severity: "high",
    scans_count: 0,
    rules_count: 0,
  };
  it("Ok valid", () => {
    expect(parseTag(VALID).isOk()).toBe(true);
  });
  it("rejects non-object / no slug", () => {
    expect(parseTag("x").isErr()).toBe(true);
    const { slug: _omit, ...withoutSlug } = VALID;
    expect(parseTag(withoutSlug).isErr()).toBe(true);
  });
  it("defaults non-string / non-number / non-bool fields", () => {
    const r = parseTag({ ...VALID, is_system: "x", scans_count: "y", category: 5 });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().is_system).toBe(false);
    expect(r._unsafeUnwrap().scans_count).toBe(0);
    expect(r._unsafeUnwrap().category).toBe("");
  });
  it("preserves explicit null organization_id (covers sOrNull null branch)", () => {
    const r = parseTag({ ...VALID, organization_id: null });
    expect(r._unsafeUnwrap().organization_id).toBeNull();
  });
  it("preserves string organization_id (covers sOrNull string branch)", () => {
    const orgId = "00000000-0000-0000-0000-000000000010";
    const r = parseTag({ ...VALID, organization_id: orgId });
    expect(r._unsafeUnwrap().organization_id).toBe(orgId);
  });
  it("coerces non-string non-null organization_id to null", () => {
    const r = parseTag({ ...VALID, organization_id: 5 });
    expect(r._unsafeUnwrap().organization_id).toBeNull();
  });
  it("parseTagDefinitionArray Ok valid + rejects bad shapes", () => {
    expect(parseTagDefinitionArray([VALID]).isOk()).toBe(true);
    expect(parseTagDefinitionArray("x").isErr()).toBe(true);
    expect(parseTagDefinitionArray([{ no: "slug" }]).isErr()).toBe(true);
  });
});

describe("parseCustomRule / parseCustomRuleArray", () => {
  const VALID = {
    id: "00000000-0000-0000-0000-000000000bbb",
    organization_id: "00000000-0000-0000-0000-000000000010",
    name: "R",
    tag_slug: "ml.spam",
    rule_type: "regex",
    config: { pattern: "x" },
    target: "html",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  };
  it("Ok valid", () => {
    expect(parseCustomRule(VALID).isOk()).toBe(true);
  });
  it("rejects non-object / no id / no organization_id", () => {
    expect(parseCustomRule("x").isErr()).toBe(true);
    const { id: _omitId, ...withoutId } = VALID;
    expect(parseCustomRule(withoutId).isErr()).toBe(true);
    const { organization_id: _omitOrg, ...withoutOrg } = VALID;
    expect(parseCustomRule(withoutOrg).isErr()).toBe(true);
  });
  it("defaults non-object config to empty", () => {
    const r = parseCustomRule({ ...VALID, config: "x" });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().config).toEqual({});
  });
  it("defaults non-bool is_active to true", () => {
    const r = parseCustomRule({ ...VALID, is_active: "x" });
    expect(r._unsafeUnwrap().is_active).toBe(true);
  });
  it("array parser Ok from bare array", () => {
    expect(parseCustomRuleArray([VALID]).isOk()).toBe(true);
  });
  it("array parser Ok from paginated envelope (FastAPI shape)", () => {
    const envelope = { items: [VALID], total: 1, page: 1, limit: 50, pages: 1 };
    const r = parseCustomRuleArray(envelope);
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toHaveLength(1);
  });
  it("array parser Ok from empty paginated envelope", () => {
    const r = parseCustomRuleArray({ items: [], total: 0, page: 1, limit: 50, pages: 0 });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual([]);
  });
  it("array parser rejects garbage (neither array nor envelope)", () => {
    expect(parseCustomRuleArray("x").isErr()).toBe(true);
    expect(parseCustomRuleArray({ items: "x" }).isErr()).toBe(true);
    expect(parseCustomRuleArray(42).isErr()).toBe(true);
  });
  it("array parser rejects when an item is malformed", () => {
    expect(parseCustomRuleArray([{}]).isErr()).toBe(true);
    expect(parseCustomRuleArray({ items: [{}] }).isErr()).toBe(true);
  });
});

describe("parseAlert / parseAlertPage", () => {
  const VALID = {
    id: "00000000-0000-0000-0000-000000000aaa",
    scan_id: "00000000-0000-0000-0000-000000000bbb",
    campaign_id: "00000000-0000-0000-0000-000000000ccc",
    policy_set_id: null,
    violation_rule_id: null,
    tag_slug: "malware",
    tag_display_name: "Malware",
    country_code: "US",
    status: "open",
    closed_by: null,
    scan_url: "https://x.com",
    offer_url: "https://o.com",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
  it("Ok valid", () => {
    expect(parseAlert(VALID).isOk()).toBe(true);
  });
  it("rejects non-object / no id", () => {
    expect(parseAlert("x").isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID;
    expect(parseAlert(withoutId).isErr()).toBe(true);
  });
  it("treats non-null non-string policy_set_id as null", () => {
    const r = parseAlert({ ...VALID, policy_set_id: 5 });
    expect(r._unsafeUnwrap().policy_set_id).toBeNull();
  });
  it("page parser Ok / rejects bad", () => {
    expect(parseAlertPage({ items: [VALID], total: 1, page: 1, limit: 50 }).isOk()).toBe(true);
    expect(parseAlertPage("x").isErr()).toBe(true);
    expect(parseAlertPage({ items: "x", total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
    expect(parseAlertPage({ items: [{}], total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
  });
});

describe("parseWebhook / parseWebhookList / parseWebhookCreated", () => {
  const VALID = {
    id: "00000000-0000-0000-0000-000000000eee",
    url: "https://x.com/wh",
    description: "ci",
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
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
  it("Ok valid", () => {
    expect(parseWebhook(VALID).isOk()).toBe(true);
  });
  it("rejects non-object / no id", () => {
    expect(parseWebhook("x").isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID;
    expect(parseWebhook(withoutId).isErr()).toBe(true);
  });
  it("filters non-string event_types entries", () => {
    const r = parseWebhook({ ...VALID, event_types: ["a", 1, "b"] });
    expect(r._unsafeUnwrap().event_types).toEqual(["a", "b"]);
  });
  it("treats non-array event_types as empty", () => {
    const r = parseWebhook({ ...VALID, event_types: "x" });
    expect(r._unsafeUnwrap().event_types).toEqual([]);
  });
  it("list parser Ok / rejects non-array / bad item", () => {
    expect(parseWebhookList([VALID]).isOk()).toBe(true);
    expect(parseWebhookList({}).isErr()).toBe(true);
    expect(parseWebhookList([{}]).isErr()).toBe(true);
  });
  it("created parser Ok with { webhook, secret } envelope", () => {
    expect(parseWebhookCreated({ webhook: VALID, secret: "whsec" }).isOk()).toBe(true);
  });
  it("created parser rejects bad shapes", () => {
    expect(parseWebhookCreated(VALID).isErr()).toBe(true);
    expect(parseWebhookCreated("x").isErr()).toBe(true);
    expect(parseWebhookCreated({ webhook: VALID, secret: 5 }).isErr()).toBe(true);
    const { id: _omit, ...webhookWithoutId } = VALID;
    expect(parseWebhookCreated({ webhook: webhookWithoutId, secret: "whsec" }).isErr()).toBe(true);
  });
});

describe("parseBillingSummary", () => {
  it("Ok with full body", () => {
    const r = parseBillingSummary({
      balance_micros: 1000,
      plan_id: "p1",
      plan_name: "pro",
      checks_per_period: 1000,
      checks_used: 5,
      period_start: "2026-01-01T00:00:00Z",
      period_end: "2026-02-01T00:00:00Z",
      price_per_extra_check_micros: 100,
      is_suspended: false,
      can_create_scan: true,
      block_reason: null,
      billing_mode: "postpaid",
    });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().billing_mode).toBe("postpaid");
  });
  it("Ok with empty body (all defaults)", () => {
    const r = parseBillingSummary({});
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.balance_micros).toBe(0);
    expect(v.plan_name).toBeNull();
    expect(v.billing_mode).toBe("prepaid");
    expect(v.can_create_scan).toBe(true);
  });
  it("rejects non-object", () => {
    expect(parseBillingSummary("x").isErr()).toBe(true);
  });
  it("treats non-string non-null plan_name as null", () => {
    const r = parseBillingSummary({ plan_name: 5 });
    expect(r._unsafeUnwrap().plan_name).toBeNull();
  });
  it("treats non-number non-null checks_per_period as null", () => {
    const r = parseBillingSummary({ checks_per_period: "x" });
    expect(r._unsafeUnwrap().checks_per_period).toBeNull();
  });
  it("preserves explicit null checks_per_period (covers nOrNull null branch)", () => {
    const r = parseBillingSummary({ checks_per_period: null });
    expect(r._unsafeUnwrap().checks_per_period).toBeNull();
  });
});

describe("parseApiKeyList", () => {
  const VALID = {
    id: "00000000-0000-0000-0000-000000000fff",
    key_prefix: "kad_abc1",
    name: "ci",
    expires_at: null,
    created_at: "2026-01-01T00:00:00Z",
  };
  it("Ok valid", () => {
    expect(parseApiKeyList([VALID]).isOk()).toBe(true);
  });
  it("rejects non-array", () => {
    expect(parseApiKeyList({}).isErr()).toBe(true);
  });
  it("rejects non-object item / no id", () => {
    expect(parseApiKeyList(["x"]).isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID;
    expect(parseApiKeyList([withoutId]).isErr()).toBe(true);
  });
  it("treats non-null non-string expires_at as null", () => {
    const r = parseApiKeyList([{ ...VALID, expires_at: 5 }]);
    expect(r._unsafeUnwrap()[0]?.expires_at).toBeNull();
  });
  it("preserves null expires_at", () => {
    const r = parseApiKeyList([{ ...VALID, expires_at: null }]);
    expect(r._unsafeUnwrap()[0]?.expires_at).toBeNull();
  });
});
