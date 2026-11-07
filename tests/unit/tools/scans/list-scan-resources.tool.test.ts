import { describe, expect, it } from "vitest";

import { listScanResourcesTool } from "../../../../src/application/tools/scans/list-scan-resources.tool.js";
import type { CapturedResource } from "../../../../src/domain/ports/api-gateway.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000777";

const resource = (index: number, url: string, resource_type = "script"): CapturedResource => ({
  index,
  url,
  resource_type,
  content_type: "application/javascript",
  size: 10,
  skipped: null,
});

const parse = (input: object) => listScanResourcesTool.inputSchema.parse(input);

describe("listScanResourcesTool", () => {
  it("is read-only", () => {
    expect(listScanResourcesTool.name).toBe("list_scan_resources");
    expect(listScanResourcesTool.annotations.readOnlyHint).toBe(true);
    expect(listScanResourcesTool.description).toContain("ONE DAY");
  });

  it("lists a landing tab's rows as a page", async () => {
    const api = createFakeApiGateway();

    const r = await listScanResourcesTool.handler(
      parse({ scan_id: SID, surface: "landing", landing_ord: 1 }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrap()).toMatchObject({ total: 1, page: 1, limit: 50 });
    expect(api.state.calls[0]).toEqual({
      method: "listScanResources",
      scanId: SID,
      surface: { kind: "landing", ord: 1 },
    });
  });

  it("filters by type and URL text, then paginates", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listScanResources = ok([
      resource(0, "https://cdn.example/a.js"),
      resource(1, "https://MyBid.example/pop.js"),
      resource(2, "https://mybid.example/feed", "xhr"),
      resource(3, "https://mybid.example/pop2.js"),
    ]);

    const r = await listScanResourcesTool.handler(
      parse({
        scan_id: SID,
        surface: "page",
        resource_type: "script",
        url_contains: "mybid",
        limit: 1,
        page: 2,
      }),
      makeToolContext({ api })
    );

    const out = r._unsafeUnwrap();
    expect(out.total).toBe(2);
    expect(out.items.map((i) => i.index)).toEqual([3]);
  });

  it("needs landing_ord for a landing", async () => {
    const api = createFakeApiGateway();

    const r = await listScanResourcesTool.handler(
      parse({ scan_id: SID, surface: "landing" }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrapErr().kind).toBe("invalid-input");
    expect(api.state.calls).toEqual([]);
  });

  it("maps expired contents to not-found", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listScanResources = err(makeApiError("not-found", "Scan not found"));

    const r = await listScanResourcesTool.handler(
      parse({ scan_id: SID, surface: "creative" }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrapErr().kind).toBe("not-found");
  });

  it("rejects an unknown surface before the gateway", () => {
    expect(() => parse({ scan_id: SID, surface: "har" })).toThrow();
  });
});
