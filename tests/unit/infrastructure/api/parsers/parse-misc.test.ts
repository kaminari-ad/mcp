/**
 * Consolidated schema-validation tests for the simpler per-domain
 * parsers (alert / api-key / billing-summary / custom-rule / emulator /
 * tag / webhook / empty). One describe block per parser; assertions
 * cover happy path + the main schema-rejection paths.
 *
 * Per-DTO defensive-default semantics from the hand-written era no
 * longer apply: zod schemas are strict. Drift between a fixture and
 * the API schema is now a deliberate test failure (catch it early).
 */

import { describe, expect, it } from "vitest";

import {
  parseAlert,
  parseAlertPage,
} from "../../../../../src/infrastructure/api/parsers/parse-alert.js";
import { parseApiKeyList } from "../../../../../src/infrastructure/api/parsers/parse-api-key.js";
import { parseBillingSummary } from "../../../../../src/infrastructure/api/parsers/parse-billing-summary.js";
import { parseCustomRule } from "../../../../../src/infrastructure/api/parsers/parse-custom-rule.js";
import { parseEmpty } from "../../../../../src/infrastructure/api/parsers/parse-empty.js";
import { parseEmulatorList } from "../../../../../src/infrastructure/api/parsers/parse-emulator.js";
import {
  parseTag,
  parseTagDefinitionArray,
} from "../../../../../src/infrastructure/api/parsers/parse-tag.js";
import {
  parseTestWebhookResponse,
  parseWebhook,
  parseWebhookCreated,
  parseWebhookList,
} from "../../../../../src/infrastructure/api/parsers/parse-webhook.js";

const UUID_A = "00000000-0000-0000-0000-000000000aaa";
const UUID_B = "00000000-0000-0000-0000-000000000bbb";
const UUID_C = "00000000-0000-0000-0000-000000000ccc";
const TS = "2026-01-01T00:00:00Z";

describe("parseEmpty", () => {
  it("always returns Ok(null) regardless of input", () => {
    expect(parseEmpty(undefined)._unsafeUnwrap()).toBeNull();
    expect(parseEmpty(42)._unsafeUnwrap()).toBeNull();
    expect(parseEmpty({ foo: "bar" })._unsafeUnwrap()).toBeNull();
  });
});

describe("parseEmulatorList", () => {
  const VALID = {
    id: "android-15-chrome",
    display_name: "X",
    category: "mobile",
    browser: "chrome",
  };
  it("Ok valid array", () => {
    expect(parseEmulatorList([VALID]).isOk()).toBe(true);
  });
  it("Ok empty array", () => {
    expect(parseEmulatorList([]).isOk()).toBe(true);
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
    slug: "malware",
    category: "security",
    source: "system",
    display_name: "Malware",
    description: "",
    is_system: true,
    organization_id: null,
    visibility: "internal",
    severity: "high",
    scans_count: 0,
    rules_count: 0,
  };
  it("Ok valid", () => {
    expect(parseTag(VALID).isOk()).toBe(true);
  });
  it("Ok with non-null organization_id (custom tag)", () => {
    const r = parseTag({ ...VALID, organization_id: "00000000-0000-0000-0000-000000000010" });
    expect(r._unsafeUnwrap().organization_id).toBe("00000000-0000-0000-0000-000000000010");
  });
  it("rejects non-object / no slug", () => {
    expect(parseTag("x").isErr()).toBe(true);
    const { slug: _omit, ...withoutSlug } = VALID;
    expect(parseTag(withoutSlug).isErr()).toBe(true);
  });
  it("rejects wrong field types (strict schema)", () => {
    expect(parseTag({ ...VALID, is_system: "x" }).isErr()).toBe(true);
    expect(parseTag({ ...VALID, organization_id: 5 }).isErr()).toBe(true);
  });
  it("parseTagDefinitionArray Ok valid + rejects bad shapes", () => {
    expect(parseTagDefinitionArray([VALID]).isOk()).toBe(true);
    expect(parseTagDefinitionArray("x").isErr()).toBe(true);
    expect(parseTagDefinitionArray([{ no: "slug" }]).isErr()).toBe(true);
  });
});

describe("parseCustomRule (single entity)", () => {
  // List endpoint coverage lives in parse-custom-rule-page.test.ts —
  // the per-page parser replaced the legacy bare-or-envelope helper
  // (`parseCustomRuleArray`) in v0.2.0.
  const VALID = {
    id: UUID_B,
    organization_id: "00000000-0000-0000-0000-000000000010",
    name: "R",
    tag_slug: "ml.spam",
    rule_type: "regex",
    config: { pattern: "x" },
    target: "page",
    is_active: true,
    created_at: TS,
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
});

describe("parseAlert / parseAlertPage", () => {
  const VALID = {
    id: UUID_A,
    scan_id: UUID_B,
    campaign_id: UUID_C,
    policy_set_id: null,
    violation_rule_id: null,
    tag_slug: "malware",
    tag_display_name: "Malware",
    country_code: "US",
    status: "open",
    closed_by: null,
    scan_url: "https://example.com/scan",
    offer_url: "https://example.com/offer",
    created_at: TS,
    updated_at: TS,
  };
  it("Ok valid", () => {
    expect(parseAlert(VALID).isOk()).toBe(true);
  });
  it("rejects on missing required (id)", () => {
    const { id: _omit, ...rest } = VALID;
    expect(parseAlert(rest).isErr()).toBe(true);
  });
  it("Ok page envelope", () => {
    expect(parseAlertPage({ items: [VALID], total: 1, page: 1, limit: 50 }).isOk()).toBe(true);
  });
  it("Ok empty page", () => {
    expect(parseAlertPage({ items: [], total: 0, page: 1, limit: 50 }).isOk()).toBe(true);
  });
  it("rejects bad envelope", () => {
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
  it("rejects non-string event_types entries (strict)", () => {
    expect(parseWebhook({ ...VALID, event_types: ["a", 1] }).isErr()).toBe(true);
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

describe("parseTestWebhookResponse", () => {
  it("Ok valid success", () => {
    const r = parseTestWebhookResponse({
      success: true,
      response_status: 200,
      elapsed_ms: 12,
      error_code: null,
      response_body: "OK",
    });
    expect(r._unsafeUnwrap().success).toBe(true);
  });
  it("Ok valid failure (null status + non-null error_code)", () => {
    const r = parseTestWebhookResponse({
      success: false,
      response_status: null,
      elapsed_ms: 5000,
      error_code: "connect",
      response_body: "",
    });
    expect(r._unsafeUnwrap().error_code).toBe("connect");
  });
  it("rejects on missing required fields", () => {
    expect(parseTestWebhookResponse({}).isErr()).toBe(true);
    expect(parseTestWebhookResponse({ success: true }).isErr()).toBe(true);
  });
  it("rejects on non-object", () => {
    expect(parseTestWebhookResponse("nope").isErr()).toBe(true);
  });
});

describe("parseBillingSummary", () => {
  const VALID = {
    balance_micros: 10000000000,
    plan_id: "00000000-0000-0000-0000-000000000abc",
    plan_name: "Basic",
    checks_per_period: 1000,
    checks_used: 0,
    period_start: TS,
    period_end: "2026-06-01T00:00:00Z",
    price_per_extra_check_micros: 100,
    is_suspended: false,
    can_create_scan: true,
    billing_mode: "prepaid",
    block_reason: null,
  };
  it("Ok valid", () => {
    expect(parseBillingSummary(VALID).isOk()).toBe(true);
  });
  it("Ok with null nullables (no plan / no block reason)", () => {
    const r = parseBillingSummary({
      ...VALID,
      plan_id: null,
      plan_name: null,
      checks_per_period: null,
    });
    expect(r.isOk()).toBe(true);
  });
  it("rejects on missing required field", () => {
    const { balance_micros: _omit, ...rest } = VALID;
    expect(parseBillingSummary(rest).isErr()).toBe(true);
  });
  it("rejects on non-object", () => {
    expect(parseBillingSummary("x").isErr()).toBe(true);
  });
});

describe("parseApiKeyList", () => {
  const VALID = {
    id: UUID_A,
    key_prefix: "kad_xx",
    name: "ci",
    expires_at: null,
    created_at: TS,
  };
  it("Ok valid", () => {
    expect(parseApiKeyList([VALID]).isOk()).toBe(true);
  });
  it("Ok with non-null expires_at", () => {
    const r = parseApiKeyList([{ ...VALID, expires_at: TS }]);
    expect(r._unsafeUnwrap()[0]?.expires_at).toBe(TS);
  });
  it("rejects non-array", () => {
    expect(parseApiKeyList({}).isErr()).toBe(true);
  });
  it("rejects when an item is malformed", () => {
    expect(parseApiKeyList([{}]).isErr()).toBe(true);
  });
});
