import { describe, expect, it } from "vitest";

import { listScanChildrenTool } from "../../../../src/application/tools/scans/list-scan-children.tool.js";
import type {
  ApiError,
  PaginatedResponse,
  ScanBriefResponse,
} from "../../../../src/domain/ports/api-gateway.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PARENT = "00000000-0000-0000-0000-000000000aaa";

describe("listScanChildrenTool", () => {
  it("has canonical name and requires a UUID scan_id", () => {
    expect(listScanChildrenTool.name).toBe("list_scan_children");
    expect(() => listScanChildrenTool.inputSchema.parse({ scan_id: "nope" })).toThrow();
    expect(() => listScanChildrenTool.inputSchema.parse({ scan_id: PARENT })).not.toThrow();
  });

  it("forwards scan_id + pagination to the gateway and returns children", async () => {
    const api = createFakeApiGateway();
    const child: ScanBriefResponse = {
      id: "00000000-0000-0000-0000-0000000000c1",
      url: "",
      country_code: "IT",
      status: "completed",
      offer_url: "https://adv.example/o",
      screenshot_url: "",
      report_url: "https://app.kaminari.ad/scans/child",
      public_report_url: "https://app.kaminari.ad/public/scans/child",
      labels: {},
      elapsed_ms: 100,
      created_at: "2026-07-20T00:00:00Z",
      is_ad_tag: false,
      is_vast: false,
      parent_scan_id: PARENT,
      ad_kind: "banner",
      slot_index: 0,
      network: "ExoClick",
    };
    api.state.responses.listScanChildren = ok<PaginatedResponse<ScanBriefResponse>, ApiError>({
      items: [child],
      total: 1,
      page: 1,
      limit: 50,
    });
    const ctx = makeToolContext({ api });

    const result = await listScanChildrenTool.handler({ scan_id: PARENT, page: 1, limit: 50 }, ctx);

    expect(result.isOk()).toBe(true);
    expect(api.state.calls[0]).toEqual({
      method: "listScanChildren",
      scanId: PARENT,
      filters: { page: 1, limit: 50 },
    });
    const page = result._unsafeUnwrap();
    expect(page.items[0]?.ad_kind).toBe("banner");
    expect(page.items[0]?.network).toBe("ExoClick");
  });

  it("maps a gateway error to a tool error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listScanChildren = err(makeApiError("not-found", "not found"));
    const ctx = makeToolContext({ api });
    const result = await listScanChildrenTool.handler({ scan_id: PARENT, page: 1, limit: 50 }, ctx);
    expect(result.isErr()).toBe(true);
  });
});
