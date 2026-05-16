/**
 * Coverage for `parse-generic.ts`. One describe block per parser; each
 * exercises happy + the main error branches so the overall file hits
 * 100% line/statement and ≥95% branch.
 */

import { describe, expect, it } from "vitest";

import {
  parseAlertDestination,
  parseAlertStats,
  parseApiKey,
  parseApiKeyCreated,
  parseArchiveOrCancel,
  parseArrayOf,
  parseBalanceTx,
  parseCampaignAlertOverrides,
  parseInvoice,
  parseOrg,
  parseOrgRole,
  parseOrgUser,
  parsePageOf,
  parseReplayResponse,
  parseRunCommand,
  parseScanTag,
  parseTagDetail,
  parseTestRule,
  parseUsage,
  parseUsageSummary,
  parseWebhookDelivery,
  parseWebhookEventCatalog,
} from "../../../../../src/infrastructure/api/parsers/parse-generic.js";
import { err, ok, type Result } from "../../../../../src/shared/result.js";
import type { ApiError } from "../../../../../src/domain/ports/api-gateway.js";

describe("parsePageOf", () => {
  const inner = (raw: unknown): Result<{ id: string }, ApiError> => {
    if (typeof raw === "object" && raw !== null && "id" in raw && typeof (raw as { id: unknown }).id === "string") {
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
    expect(parseOrg({ id: "o1", name: "X", created_at: "t", settings: {} }).isOk()).toBe(true);
    expect(parseOrg("x").isErr()).toBe(true);
    expect(parseOrg({ name: "no id" }).isErr()).toBe(true);
  });
  it("parseOrgUser defensive defaults", () => {
    const r = parseOrgUser({ id: "u1", email: 42 });
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().email).toBe("");
  });
  it("parseOrgRole filters non-string permissions", () => {
    const r = parseOrgRole({ id: "r1", permissions: ["a", 1, "b"] });
    expect(r._unsafeUnwrap().permissions).toEqual(["a", "b"]);
  });
  it("parseApiKey Ok / Err", () => {
    expect(parseApiKey({ id: "k1", key_prefix: "p", name: "n" }).isOk()).toBe(true);
    expect(parseApiKey({}).isErr()).toBe(true);
  });
  it("parseApiKeyCreated Ok / requires full_key", () => {
    expect(parseApiKeyCreated({ id: "k1", full_key: "secret" }).isOk()).toBe(true);
    expect(parseApiKeyCreated({ id: "k1" }).isErr()).toBe(true);
    expect(parseApiKeyCreated("x").isErr()).toBe(true);
  });
  it("parseArchiveOrCancel Ok / Err", () => {
    expect(parseArchiveOrCancel({ id: "x", affected_count: 5 }).isOk()).toBe(true);
    expect(parseArchiveOrCancel({}).isErr()).toBe(true);
  });
  it("parseTagDetail Ok / Err / null org id", () => {
    expect(parseTagDetail({ slug: "x", organization_id: null }).isOk()).toBe(true);
    expect(parseTagDetail({}).isErr()).toBe(true);
    expect(parseTagDetail("x").isErr()).toBe(true);
  });
  it("parseScanTag Ok / Err", () => {
    expect(parseScanTag({ slug: "x" }).isOk()).toBe(true);
    expect(parseScanTag({}).isErr()).toBe(true);
    expect(parseScanTag("x").isErr()).toBe(true);
  });
  it("parseUsage Ok", () => {
    expect(parseUsage({ id: "x" }).isOk()).toBe(true);
  });
  it("parseBalanceTx Ok", () => {
    expect(parseBalanceTx({ id: "x" }).isOk()).toBe(true);
  });
  it("parseInvoice Ok / null paid_at coercion", () => {
    const r = parseInvoice({ id: "x", paid_at: 5 });
    expect(r._unsafeUnwrap().paid_at).toBeNull();
  });
  it("parseWebhookDelivery Ok / null response_status", () => {
    const r = parseWebhookDelivery({ id: "x", response_status: null });
    expect(r._unsafeUnwrap().response_status).toBeNull();
  });
  it("parseAlertDestination Ok", () => {
    expect(parseAlertDestination({ id: "x" }).isOk()).toBe(true);
  });
});

describe("standalone parsers", () => {
  it("parseRunCommand Ok / Err", () => {
    expect(parseRunCommand({ run_id: "x" }).isOk()).toBe(true);
    expect(parseRunCommand({}).isErr()).toBe(true);
    expect(parseRunCommand("x").isErr()).toBe(true);
  });
  it("parseTestRule Ok with defaults", () => {
    const r = parseTestRule({});
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().matched).toBe(false);
    expect(parseTestRule("x").isErr()).toBe(true);
  });
  it("parseAlertStats Ok", () => {
    expect(parseAlertStats({ open: 1 }).isOk()).toBe(true);
    expect(parseAlertStats("x").isErr()).toBe(true);
  });
  it("parseUsageSummary Ok / Err", () => {
    expect(parseUsageSummary({}).isOk()).toBe(true);
    expect(parseUsageSummary("x").isErr()).toBe(true);
  });
  it("parseWebhookEventCatalog Ok / Err", () => {
    expect(parseWebhookEventCatalog({ types: [{ type: "scan.done" }] }).isOk()).toBe(true);
    expect(parseWebhookEventCatalog("x").isErr()).toBe(true);
    expect(parseWebhookEventCatalog({ types: "x" }).isErr()).toBe(true);
    expect(parseWebhookEventCatalog({ types: ["x"] }).isErr()).toBe(true);
    expect(parseWebhookEventCatalog({ types: [{ noType: "x" }] }).isErr()).toBe(true);
  });
  it("parseCampaignAlertOverrides Ok / Err", () => {
    expect(
      parseCampaignAlertOverrides({ campaign_id: "x", destination_ids: ["a"], muted: false }).isOk()
    ).toBe(true);
    expect(parseCampaignAlertOverrides("x").isErr()).toBe(true);
    expect(parseCampaignAlertOverrides({}).isErr()).toBe(true);
  });
  it("parseReplayResponse Ok / Err", () => {
    expect(parseReplayResponse({ replayed_count: 5 }).isOk()).toBe(true);
    expect(parseReplayResponse({}).isErr()).toBe(true);
    expect(parseReplayResponse("x").isErr()).toBe(true);
  });
});
