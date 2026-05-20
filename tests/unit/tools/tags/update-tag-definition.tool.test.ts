import { describe, expect, it } from "vitest";

import { updateTagDefinitionTool } from "../../../../src/application/tools/tags/update-tag-definition.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("updateTagDefinitionTool", () => {
  it("name + severity enum validation", () => {
    expect(updateTagDefinitionTool.name).toBe("update_tag_definition");
    expect(() =>
      updateTagDefinitionTool.inputSchema.parse({ slug: "x", severity: "weird" })
    ).toThrow();
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
      {
        slug: "x",
        display_name: "Y",
        description: "d",
        severity: "low",
        visibility: "public",
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateTagDefinition") throw new Error("wrong");
    expect(call.body.description).toBe("d");
    expect(call.body.visibility).toBe("public");
  });

  it("strips legacy 'show_in_public_report' field (regression for COOP-13940 P3 rename)", () => {
    // The COOP-13940 P3 rename replaced the boolean
    // `show_in_public_report` with the `visibility` enum. Old agents
    // sending the legacy key must not have it forwarded to the API —
    // zod's strict object-pick drops the unknown field silently, but
    // we assert the body never carries it.
    const parsed = updateTagDefinitionTool.inputSchema.parse({
      slug: "x",
      show_in_public_report: true,
    } as unknown as Record<string, unknown>);
    expect("show_in_public_report" in parsed).toBe(false);
  });

  it("validates visibility enum", () => {
    expect(() =>
      updateTagDefinitionTool.inputSchema.parse({ slug: "x", visibility: "weird" })
    ).toThrow();
    for (const v of ["hidden", "internal", "public"] as const) {
      expect(
        updateTagDefinitionTool.inputSchema.parse({ slug: "x", visibility: v }).visibility
      ).toBe(v);
    }
  });

  it("rejects empty patch with invalid-input (no upstream call)", async () => {
    // Sending only `slug` with nothing to update is a programming
    // error, not a meaningful API call — the guard short-circuits
    // before reaching the gateway so the agent gets a typed
    // `invalid-input` instead of an upstream 400/422.
    const api = createFakeApiGateway();
    const r = await updateTagDefinitionTool.handler({ slug: "x" }, makeToolContext({ api }));
    expect(r.isErr()).toBe(true);
    if (r.isErr()) expect(r.error.kind).toBe("invalid-input");
    expect(api.state.calls).toHaveLength(0);
  });

  it("maps error from gateway when at least one field IS set", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateTagDefinition = err(makeApiError("forbidden", "x"));
    expect(
      (
        await updateTagDefinitionTool.handler(
          { slug: "x", display_name: "Y" },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
