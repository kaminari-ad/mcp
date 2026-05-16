import { describe, expect, it } from "vitest";

import { listGeosTool } from "../../../../src/application/tools/geos/list-geos.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listGeosTool", () => {
  it("has the canonical name and zero-field schema", () => {
    expect(listGeosTool.name).toBe("list_geos");
    expect(Object.keys(listGeosTool.inputSchema.shape)).toEqual([]);
  });

  it("returns items + total on success", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listGeos = ok([
      { code: "US", name: "United States", continent: "NA", emoji: "🇺🇸" },
      { code: "DE", name: "Germany", continent: "EU", emoji: "🇩🇪" },
    ]);
    const ctx = makeToolContext({ api });
    const result = await listGeosTool.handler({}, ctx);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      items: [
        { code: "US", name: "United States", continent: "NA", emoji: "🇺🇸" },
        { code: "DE", name: "Germany", continent: "EU", emoji: "🇩🇪" },
      ],
      total: 2,
    });
  });

  it("maps gateway error into ToolError", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listGeos = err(makeApiError("upstream", "down"));
    const ctx = makeToolContext({ api });
    const result = await listGeosTool.handler({}, ctx);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({ kind: "upstream", message: "down" });
  });
});
