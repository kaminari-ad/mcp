/**
 * Consolidated tests for the simpler per-domain parsers
 * (one batch covers emulator / tag / custom-rule / alert / webhook /
 * billing-summary / api-key / empty). Each parser owns a focused
 * description block; assertions cover happy path + the main error
 * branches so coverage stays at 100%.
 */

import { describe, expect, it } from "vitest";

import { parseAlert, parseAlertPage } from "../../../../../src/infrastructure/api/parsers/parse-alert.js";
import { parseApiKeyList } from "../../../../../src/infrastructure/api/parsers/parse-api-key.js";
import { parseBillingSummary } from "../../../../../src/infrastructure/api/parsers/parse-billing-summary.js";
import {
  parseCustomRule,
  parseCustomRulePage,
} from "../../../../../src/infrastructure/api/parsers/parse-custom-rule.js";
import { parseEmpty } from "../../../../../src/infrastructure/api/parsers/parse-empty.js";
import { parseEmulatorList } from "../../../../../src/infrastructure/api/parsers/parse-emulator.js";
import { parseTag, parseTagPage } from "../../../../../src/infrastructure/api/parsers/parse-tag.js";
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

describe("parseTag / parseTagPage", () => {
  const VALID = {
    slug: "x",
    category: "c",
    source: "system",
    display_name: "X",
    description: "",
    is_system: true,
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
  it("parseTagPage Ok valid + rejects bad shapes", () => {
    expect(parseTagPage({ items: [VALID], total: 1, page: 1, limit: 50 }).isOk()).toBe(true);
    expect(parseTagPage("x").isErr()).toBe(true);
    expect(parseTagPage({ items: "x", total: 1, page: 1, limit: 50 }).isErr()).toBe(true);
    expect(parseTagPage({ items: [{ no: "slug" }], total: 1, page: 1, limit: 50 }).isErr()).toBe(
      true
    );
  });
});

describe("parseCustomRule / parseCustomRulePage", () => {
  const VALID = {
    id: "00000000-0000-0000-0000-000000000bbb",
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
  it("rejects non-object / no id", () => {
    expect(parseCustomRule("x").isErr()).toBe(true);
    const { id: _omit, ...withoutId } = VALID;
    expect(parseCustomRule(withoutId).isErr()).toBe(true);
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
  it("page parser Ok / rejects bad", () => {
    expect(
      parseCustomRulePage({ items: [VALID], total: 1, page: 1, limit: 50 }).isOk()
    ).toBe(true);
    expect(parseCustomRulePage("x").isErr()).toBe(true);
    expect(
      parseCustomRulePage({ items: "x", total: 1, page: 1, limit: 50 }).isErr()
    ).toBe(true);
    expect(
      parseCustomRulePage({ items: [{}], total: 1, page: 1, limit: 50 }).isErr()
    ).toBe(true);
  });
});

describe("parseAlert / parseAlertPage", () => {
  const VALID = {
    id: "00000000-0000-0000-0000-000000000aaa",
    scan_id: "00000000-0000-0000-0000-000000000bbb",
    campaign_id: "00000000-0000-0000-0000-000000000ccc",
    policy_set_id: null,
    tag_slug: "malware",
    tag_display_name: "Malware",
    country_code: "US",
    status: "open",
    scan_url: "https://x.com",
    offer_url: "https://o.com",
    created_at: "2026-01-01T00:00:00Z",
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
    event_types: ["scan.done"],
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
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
  it("created parser Ok with secret", () => {
    expect(parseWebhookCreated({ ...VALID, signing_secret: "whsec" }).isOk()).toBe(true);
  });
  it("created parser rejects missing secret", () => {
    expect(parseWebhookCreated(VALID).isErr()).toBe(true);
    expect(parseWebhookCreated("x").isErr()).toBe(true);
    expect(parseWebhookCreated({ ...VALID, signing_secret: 5 }).isErr()).toBe(true);
  });
});

describe("parseBillingSummary", () => {
  it("Ok with full body", () => {
    const r = parseBillingSummary({
      balance_micros: 1000,
      plan_name: "pro",
      checks_per_period: 1000,
      checks_used: 5,
      period_start: "2026-01-01T00:00:00Z",
      period_end: "2026-02-01T00:00:00Z",
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
});
