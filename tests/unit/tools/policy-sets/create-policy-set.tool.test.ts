import { describe, expect, it } from "vitest";

import { createPolicySetTool } from "../../../../src/application/tools/policy-sets/create-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createPolicySetTool", () => {
  it("name + validates entries.min(1) + required description", () => {
    expect(createPolicySetTool.name).toBe("create_policy_set");
    expect(() =>
      createPolicySetTool.inputSchema.parse({ name: "x", description: "", entries: [] })
    ).toThrow();
    expect(() =>
      createPolicySetTool.inputSchema.parse({
        name: "x",
        entries: [{ tag_slug: "y", country_codes: [] }],
      })
    ).toThrow();
  });

  it("forwards body verbatim", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createPolicySetTool.handler(
      {
        name: "Safe",
        description: "Block malware",
        entries: [{ tag_slug: "malware", country_codes: ["US"] }],
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createPolicySet") throw new Error("wrong");
    expect(call.body.name).toBe("Safe");
    expect(call.body.description).toBe("Block malware");
    expect(call.body.entries[0]?.tag_slug).toBe("malware");
    expect(call.body.entries[0]?.country_codes).toEqual(["US"]);
  });

  it("accepts empty description string", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createPolicySetTool.handler(
      {
        name: "x",
        description: "",
        entries: [{ tag_slug: "malware", country_codes: [] }],
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createPolicySet") throw new Error("wrong");
    expect(call.body.description).toBe("");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createPolicySet = err(makeApiError("invalid-input", "x"));
    expect(
      (
        await createPolicySetTool.handler(
          {
            name: "x",
            description: "",
            entries: [{ tag_slug: "y", country_codes: [] }],
          },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
