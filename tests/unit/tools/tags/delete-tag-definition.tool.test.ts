import { describe, expect, it } from "vitest";

import { deleteTagDefinitionTool } from "../../../../src/application/tools/tags/delete-tag-definition.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("deleteTagDefinitionTool", () => {
  it("destructive annotation", () => {
    expect(deleteTagDefinitionTool.name).toBe("delete_tag_definition");
    expect(deleteTagDefinitionTool.annotations.destructiveHint).toBe(true);
  });
  it("returns deleted=true and forwards the slug", async () => {
    const api = createFakeApiGateway();
    const r = await deleteTagDefinitionTool.handler({ slug: "ml.spam" }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({ deleted: true });
    expect(api.state.calls[0]).toEqual({ method: "deleteTagDefinition", slug: "ml.spam" });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.deleteTagDefinition = err(makeApiError("forbidden", "system tag"));
    expect(
      (await deleteTagDefinitionTool.handler({ slug: "x" }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
