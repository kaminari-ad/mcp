import { describe, expect, it } from "vitest";

import { parseCustomTaxonomyTextTool } from "../../../../src/application/tools/custom-taxonomies/parse-custom-taxonomy-text.tool.js";
import type { ParseTaxonomyTextResponse } from "../../../../src/domain/ports/api-gateway.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("parseCustomTaxonomyTextTool", () => {
  it("name + read-only + non-empty text validation", () => {
    expect(parseCustomTaxonomyTextTool.name).toBe("parse_custom_taxonomy_text");
    expect(parseCustomTaxonomyTextTool.annotations.readOnlyHint).toBe(true);
    expect(() => parseCustomTaxonomyTextTool.inputSchema.parse({ text: "" })).toThrow();
    expect(() =>
      parseCustomTaxonomyTextTool.inputSchema.parse({ text: "x".repeat(50001) })
    ).toThrow();
  });

  it("forwards text and returns nodes + warnings", async () => {
    const api = createFakeApiGateway();
    const fixture: ParseTaxonomyTextResponse = {
      nodes: [{ level: 1, name: "Root", description: "" }],
      warnings: ["repaired indent on line 3"],
    };
    api.state.responses.parseCustomTaxonomyText = ok<ParseTaxonomyTextResponse>(fixture);
    const r = await parseCustomTaxonomyTextTool.handler(
      { text: "Root\n  Child" },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap()).toEqual(fixture);
    const call = api.state.calls[0];
    if (call?.method !== "parseCustomTaxonomyText") throw new Error("wrong");
    expect(call.body.text).toBe("Root\n  Child");
  });

  it("maps api error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.parseCustomTaxonomyText = err(makeApiError("invalid-input", "x"));
    expect(
      (await parseCustomTaxonomyTextTool.handler({ text: "x" }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
