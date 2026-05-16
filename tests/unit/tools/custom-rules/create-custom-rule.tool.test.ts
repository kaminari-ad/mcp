import { describe, expect, it } from "vitest";

import { createCustomRuleTool } from "../../../../src/application/tools/custom-rules/create-custom-rule.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createCustomRuleTool", () => {
  it("name + validates name length", () => {
    expect(createCustomRuleTool.name).toBe("create_custom_rule");
    expect(() =>
      createCustomRuleTool.inputSchema.parse({ name: "", rule_type: "regex", config: {} })
    ).toThrow();
  });

  it("forwards body and omits absent optionals", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCustomRuleTool.handler(
      {
        name: "RX",
        rule_type: "regex",
        config: { pattern: "viagra" },
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCustomRule") throw new Error("wrong");
    expect(call.body.name).toBe("RX");
    expect(call.body.tag_slug).toBeUndefined();
    expect(call.body.target).toBeUndefined();
  });

  it("forwards tag_slug and target when supplied", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createCustomRuleTool.handler(
      {
        name: "RX",
        tag_slug: "ml.spam",
        rule_type: "regex",
        config: { pattern: "x" },
        target: "html",
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCustomRule") throw new Error("wrong");
    expect(call.body.tag_slug).toBe("ml.spam");
    expect(call.body.target).toBe("html");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createCustomRule = err(makeApiError("invalid-input", "x"));
    expect(
      (
        await createCustomRuleTool.handler(
          { name: "RX", rule_type: "regex", config: {} },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
