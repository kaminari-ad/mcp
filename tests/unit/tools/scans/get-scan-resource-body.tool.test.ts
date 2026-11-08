import { describe, expect, it } from "vitest";

import { getScanResourceBodyTool } from "../../../../src/application/tools/scans/get-scan-resource-body.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000777";

const parse = (input: object) => getScanResourceBodyTool.inputSchema.parse(input);

const bundle = (body: string | null, skipped: string | null = null) =>
  ok({
    index: 4,
    url: "https://mybid.example/pop.js",
    resource_type: "script",
    content_type: "application/javascript",
    size: 600_000,
    skipped,
    body,
  });

describe("getScanResourceBodyTool", () => {
  it("is read-only", () => {
    expect(getScanResourceBodyTool.name).toBe("get_scan_resource_body");
    expect(getScanResourceBodyTool.annotations.readOnlyHint).toBe(true);
  });

  it("returns the whole body when it fits one chunk", async () => {
    const api = createFakeApiGateway();

    const r = await getScanResourceBodyTool.handler(
      parse({ scan_id: SID, surface: "page", index: 0 }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrap()).toMatchObject({
      body: "var a = 1;",
      total_length: 10,
      offset: 0,
      length: 10,
      next_offset: null,
    });
    expect(api.state.calls[0]).toEqual({
      method: "getScanResourceBody",
      scanId: SID,
      surface: { kind: "page" },
      index: 0,
    });
  });

  it("walks a large body chunk by chunk", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanResourceBody = bundle("abcdefghij");
    const ctx = makeToolContext({ api });

    const first = await getScanResourceBodyTool.handler(
      parse({ scan_id: SID, surface: "creative", index: 4, length: 4 }),
      ctx
    );
    const last = await getScanResourceBodyTool.handler(
      parse({ scan_id: SID, surface: "creative", index: 4, offset: 8, length: 4 }),
      ctx
    );

    expect(first._unsafeUnwrap()).toMatchObject({ body: "abcd", next_offset: 4 });
    expect(last._unsafeUnwrap()).toMatchObject({ body: "ij", length: 2, next_offset: null });
  });

  it("returns an empty, final chunk for an offset past the end", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanResourceBody = bundle("abc");

    const r = await getScanResourceBodyTool.handler(
      parse({ scan_id: SID, surface: "page", index: 4, offset: 10 }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrap()).toMatchObject({
      body: "",
      length: 0,
      total_length: 3,
      next_offset: null,
    });
  });

  it("returns an empty body with the reason for a skipped row", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanResourceBody = bundle(null, "too_large");

    const r = await getScanResourceBodyTool.handler(
      parse({ scan_id: SID, surface: "page", index: 4 }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrap()).toMatchObject({ skipped: "too_large", body: "", total_length: 0 });
  });

  it("is not-found past the last row", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanResourceBody = ok(null);

    const r = await getScanResourceBodyTool.handler(
      parse({ scan_id: SID, surface: "page", index: 99 }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrapErr()).toMatchObject({ kind: "not-found" });
    expect(r._unsafeUnwrapErr().message).toContain("list_scan_resources");
  });

  it("needs landing_ord for a landing", async () => {
    const api = createFakeApiGateway();

    const r = await getScanResourceBodyTool.handler(
      parse({ scan_id: SID, surface: "landing", index: 0 }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrapErr().kind).toBe("invalid-input");
    expect(api.state.calls).toEqual([]);
  });

  it("maps expired contents to not-found", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getScanResourceBody = err(makeApiError("not-found", "Scan not found"));

    const r = await getScanResourceBodyTool.handler(
      parse({ scan_id: SID, surface: "landing", landing_ord: 0, index: 0 }),
      makeToolContext({ api })
    );

    expect(r._unsafeUnwrapErr().kind).toBe("not-found");
  });

  it("rejects an oversized chunk before the gateway", () => {
    expect(() => parse({ scan_id: SID, surface: "page", index: 0, length: 500_000 })).toThrow();
  });
});
