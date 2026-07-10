import { describe, expect, it } from "vitest";

import { listScansTool } from "../../../../src/application/tools/scans/list-scans.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SCAN_BRIEF = {
  id: "00000000-0000-0000-0000-000000000aaa",
  url: "https://ad.example.com/a",
  country_code: "US",
  status: "completed" as const,
  offer_url: "https://offer.example",
  screenshot_url: "",
  report_url: "https://app.kaminari.ad/scans/00000000-0000-0000-0000-000000000aaa",
  public_report_url: "https://app.kaminari.ad/public/scans/00000000-0000-0000-0000-000000000aaa",
  labels: {},
  elapsed_ms: 100,
  campaign_id: null,
  campaign_name: null,
  is_ad_tag: false,
  is_vast: false,
  created_at: "2026-05-16T10:00:00Z",
};

describe("listScansTool", () => {
  it("has the canonical name and pagination defaults", () => {
    expect(listScansTool.name).toBe("list_scans");
    const parsed = listScansTool.inputSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(50);
  });

  it("forwards filters verbatim to the gateway and returns the page envelope", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listScans = ok({
      items: [SCAN_BRIEF],
      total: 1,
      page: 1,
      limit: 50,
    });

    const ctx = makeToolContext({ api });
    const result = await listScansTool.handler(
      { status: "completed", country_code: "US", page: 1, limit: 50 },
      ctx
    );
    expect(result.isOk()).toBe(true);
    const items = result._unsafeUnwrap().items;
    expect(items).toHaveLength(1);
    expect(items[0]?.is_ad_tag).toBe(false);
    expect(items[0]?.is_vast).toBe(false);

    const call = api.state.calls[0];
    expect(call?.method).toBe("listScans");
    if (call?.method === "listScans") {
      expect(call.filters).toMatchObject({ status: "completed", country_code: "US" });
    }
  });

  it("surfaces the is_vast flag for VAST scans", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listScans = ok({
      items: [{ ...SCAN_BRIEF, url: "", is_ad_tag: false, is_vast: true }],
      total: 1,
      page: 1,
      limit: 50,
    });
    const ctx = makeToolContext({ api });
    const result = await listScansTool.handler({ page: 1, limit: 50 }, ctx);
    expect(result._unsafeUnwrap().items[0]?.is_vast).toBe(true);
  });

  it("rejects an over-large limit at zod boundary", () => {
    expect(() => listScansTool.inputSchema.parse({ limit: 500 })).toThrow();
  });

  it("maps an ApiError into a ToolError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listScans = err(makeApiError("forbidden", "no access"));
    const ctx = makeToolContext({ api });
    const result = await listScansTool.handler({ page: 1, limit: 50 }, ctx);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ kind: "forbidden", message: "no access" });
  });

  it("passes every defined optional field through to the gateway", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listScansTool.handler(
      {
        status: "completed",
        country_code: "US",
        url: "ad.example",
        scan_id: "00000000-0000-0000-0000-000000000aaa",
        date_from: "2026-05-01",
        date_to: "2026-05-16",
        timezone: "Europe/Berlin",
        run_id: "00000000-0000-0000-0000-000000000bbb",
        campaign_id: "00000000-0000-0000-0000-000000000ccc",
        group_id: "00000000-0000-0000-0000-000000000ddd",
        tag: "redirect",
        ai_category: "Gambling/Online Casinos",
        iab_v3_category: "Sensitive Topics/Adult Content",
        iab_category: "IAB7-39",
        brand: "Acme",
        labels: { brand_safety: "high", vertical: "gambling" },
        page: 1,
        limit: 50,
      },
      ctx
    );
    const call = api.state.calls[0];
    expect(call?.method).toBe("listScans");
    if (call?.method === "listScans") {
      expect(call.filters).toMatchObject({
        page: 1,
        limit: 50,
        status: "completed",
        country_code: "US",
        url: "ad.example",
        scan_id: "00000000-0000-0000-0000-000000000aaa",
        date_from: "2026-05-01",
        date_to: "2026-05-16",
        timezone: "Europe/Berlin",
        run_id: "00000000-0000-0000-0000-000000000bbb",
        campaign_id: "00000000-0000-0000-0000-000000000ccc",
        group_id: "00000000-0000-0000-0000-000000000ddd",
        tag: "redirect",
        ai_category: "Gambling/Online Casinos",
        iab_v3_category: "Sensitive Topics/Adult Content",
        iab_category: "IAB7-39",
        brand: "Acme",
        label_brand_safety: "high",
        label_vertical: "gambling",
      });
    }
  });

  it("omits all optional fields when only page+limit supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await listScansTool.handler({ page: 1, limit: 50 }, ctx);
    const call = api.state.calls[0];
    if (call?.method === "listScans") {
      expect(Object.keys(call.filters).sort()).toEqual(["limit", "page"]);
    }
  });
});
