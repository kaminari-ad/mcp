import { describe, expect, it } from "vitest";
import { listScanTagsTool } from "../../../../src/application/tools/tags/list-scan-tags.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000aaa";

describe("listScanTagsTool", () => {
  it("name + read-only", () => {
    expect(listScanTagsTool.name).toBe("list_scan_tags");
    expect(listScanTagsTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listScanTags = ok([
      { slug: "malware", display_name: "Malware", category: "security", severity: "high", source: "system" },
    ]);
    const r = await listScanTagsTool.handler({ scan_id: SID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().total).toBe(1);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listScanTags = err(makeApiError("not-found", "x"));
    expect((await listScanTagsTool.handler({ scan_id: SID }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
