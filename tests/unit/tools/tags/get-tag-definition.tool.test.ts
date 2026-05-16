import { describe, expect, it } from "vitest";
import { getTagDefinitionTool } from "../../../../src/application/tools/tags/get-tag-definition.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getTagDefinitionTool", () => {
  it("name + read-only", () => {
    expect(getTagDefinitionTool.name).toBe("get_tag_definition");
    expect(getTagDefinitionTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns tag", async () => {
    const api = createFakeApiGateway();
    const r = await getTagDefinitionTool.handler({ slug: "malware" }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().slug).toBe("malware");
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getTagDefinition = err(makeApiError("not-found", "x"));
    expect((await getTagDefinitionTool.handler({ slug: "x" }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
