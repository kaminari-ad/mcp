import { describe, expect, it } from "vitest";

import { getTagDefinitionTool } from "../../../../src/application/tools/tags/get-tag-definition.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getTagDefinitionTool", () => {
  it("name + read-only", () => {
    expect(getTagDefinitionTool.name).toBe("get_tag_definition");
    expect(getTagDefinitionTool.annotations.readOnlyHint).toBe(true);
  });
  it("forwards the slug to the gateway", async () => {
    const api = createFakeApiGateway();
    const r = await getTagDefinitionTool.handler({ slug: "malware" }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    const call = api.state.calls[0];
    if (call?.method !== "getTagDefinition") throw new Error("wrong");
    expect(call.slug).toBe("malware");
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getTagDefinition = err(makeApiError("not-found", "x"));
    expect(
      (await getTagDefinitionTool.handler({ slug: "x" }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });

  // v0.2.0: the tool output MUST surface `linked_rules` — the custom
  // rules currently producing this tag. Previously dropped silently.
  it("surfaces linked_rules in the output", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getTagDefinition = ok({
      slug: "malware",
      category: "security",
      source: "system",
      display_name: "Malware",
      description: "Tag for malware redirects.",
      severity: "high",
      is_system: true,
      organization_id: null,
      show_in_public_report: true,
      scans_count: 5,
      rules_count: 2,
      linked_rules: [
        { id: "00000000-0000-0000-0000-000000000abc", name: "ad-detector", is_active: true },
        { id: "00000000-0000-0000-0000-000000000def", name: "old-rule", is_active: false },
      ],
    });
    const r = await getTagDefinitionTool.handler({ slug: "malware" }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.linked_rules).toHaveLength(2);
    expect(v.linked_rules?.[0]?.name).toBe("ad-detector");
    expect(v.linked_rules?.[1]?.is_active).toBe(false);
  });
});
