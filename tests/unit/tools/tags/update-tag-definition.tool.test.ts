import { describe, expect, it } from "vitest";
import { updateTagDefinitionTool } from "../../../../src/application/tools/tags/update-tag-definition.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("updateTagDefinitionTool", () => {
  it("name + severity enum validation", () => {
    expect(updateTagDefinitionTool.name).toBe("update_tag_definition");
    expect(() => updateTagDefinitionTool.inputSchema.parse({ slug: "x", severity: "weird" })).toThrow();
  });
  it("forwards only supplied fields", async () => {
    const api = createFakeApiGateway();
    await updateTagDefinitionTool.handler(
      { slug: "x", display_name: "Y", severity: "high" },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateTagDefinition") throw new Error("wrong");
    expect(Object.keys(call.body).sort()).toEqual(["display_name", "severity"]);
  });
  it("forwards all fields when supplied", async () => {
    const api = createFakeApiGateway();
    await updateTagDefinitionTool.handler(
      { slug: "x", display_name: "Y", description: "d", severity: "low", show_in_public_report: true },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateTagDefinition") throw new Error("wrong");
    expect(call.body.description).toBe("d");
    expect(call.body.show_in_public_report).toBe(true);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateTagDefinition = err(makeApiError("forbidden", "x"));
    expect((await updateTagDefinitionTool.handler({ slug: "x" }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
