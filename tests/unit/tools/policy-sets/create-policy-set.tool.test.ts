import { describe, expect, it } from "vitest";

import { createPolicySetTool } from "../../../../src/application/tools/policy-sets/create-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const TAG_ENTRY = { rule_type: "tag" as const, tag_slug: "malware", country_codes: ["US"] };

describe("createPolicySetTool", () => {
  it("name + validates entries.min(1) + required description", () => {
    expect(createPolicySetTool.name).toBe("create_policy_set");
    expect(() =>
      createPolicySetTool.inputSchema.parse({ name: "x", description: "", entries: [] })
    ).toThrow();
    expect(() =>
      createPolicySetTool.inputSchema.parse({
        name: "x",
        entries: [TAG_ENTRY],
      })
    ).toThrow();
  });

  it("rejects entry without rule_type discriminator", () => {
    expect(() =>
      createPolicySetTool.inputSchema.parse({
        name: "x",
        description: "",
        entries: [{ tag_slug: "malware", country_codes: [] }],
      })
    ).toThrow();
  });

  it("rejects each rule kind with its value-block missing", () => {
    // One rejection test per rule kind — guards the discriminated
    // union doesn't silently let agents send a non-tag rule_type
    // without the matching value-block.
    const cases: readonly { rule_type: string }[] = [
      { rule_type: "iab_v3" },
      { rule_type: "brand" },
      { rule_type: "ai_category" },
      { rule_type: "custom_taxonomy" },
    ];
    for (const c of cases) {
      expect(() =>
        createPolicySetTool.inputSchema.parse({
          name: "x",
          description: "",
          entries: [{ ...c, country_codes: [] }],
        })
      ).toThrow();
    }
  });

  it("rejects tag rule with missing tag_slug", () => {
    expect(() =>
      createPolicySetTool.inputSchema.parse({
        name: "x",
        description: "",
        entries: [{ rule_type: "tag", country_codes: [] }],
      })
    ).toThrow();
  });

  it("forwards body verbatim for tag rule (legacy)", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createPolicySetTool.handler(
      {
        name: "Safe",
        description: "Block malware",
        entries: [TAG_ENTRY],
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createPolicySet") throw new Error("wrong");
    expect(call.body.name).toBe("Safe");
    expect(call.body.description).toBe("Block malware");
    expect(call.body.entries[0]?.rule_type).toBe("tag");
    expect(call.body.entries[0]?.tag_slug).toBe("malware");
    expect(call.body.entries[0]?.country_codes).toEqual(["US"]);
    expect(call.body.entries[0]?.iab_v3).toBeNull();
    expect(call.body.entries[0]?.brand).toBeNull();
    expect(call.body.entries[0]?.ai_category).toBeNull();
    expect(call.body.entries[0]?.custom_taxonomy).toBeNull();
  });

  it("forwards iab_v3 rule with normalised tier nulls", async () => {
    const api = createFakeApiGateway();
    await createPolicySetTool.handler(
      {
        name: "n",
        description: "",
        entries: [
          {
            rule_type: "iab_v3",
            iab_v3: { tier1: "Sensitive Topics", tier2: "Adult Content" },
            country_codes: ["GBR"],
          },
        ],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createPolicySet") throw new Error("wrong");
    const e = call.body.entries[0];
    if (!e) throw new Error("entry missing");
    expect(e.rule_type).toBe("iab_v3");
    expect(e.tag_slug).toBeNull();
    expect(e.iab_v3).toEqual({
      tier1: "Sensitive Topics",
      tier2: "Adult Content",
      tier3: null,
      tier4: null,
    });
  });

  it("forwards brand rule", async () => {
    const api = createFakeApiGateway();
    await createPolicySetTool.handler(
      {
        name: "n",
        description: "",
        entries: [{ rule_type: "brand", brand: "Acme", country_codes: [] }],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createPolicySet") throw new Error("wrong");
    expect(call.body.entries[0]?.brand).toBe("Acme");
  });

  it("forwards ai_category rule", async () => {
    const api = createFakeApiGateway();
    await createPolicySetTool.handler(
      {
        name: "n",
        description: "",
        entries: [
          {
            rule_type: "ai_category",
            ai_category: { tier1: "Gambling" },
            country_codes: [],
          },
        ],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createPolicySet") throw new Error("wrong");
    expect(call.body.entries[0]?.ai_category).toEqual({
      tier1: "Gambling",
      tier2: null,
      tier3: null,
      tier4: null,
    });
  });

  it("forwards custom_taxonomy rule", async () => {
    const api = createFakeApiGateway();
    await createPolicySetTool.handler(
      {
        name: "n",
        description: "",
        entries: [
          {
            rule_type: "custom_taxonomy",
            custom_taxonomy: {
              taxonomy_id: "00000000-0000-0000-0000-0000000000aa",
              tier1: "Risky",
            },
            country_codes: [],
          },
        ],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createPolicySet") throw new Error("wrong");
    expect(call.body.entries[0]?.custom_taxonomy?.taxonomy_id).toBe(
      "00000000-0000-0000-0000-0000000000aa"
    );
    expect(call.body.entries[0]?.custom_taxonomy?.tier1).toBe("Risky");
  });

  it("accepts empty description string + alpha-3 country codes", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });
    await createPolicySetTool.handler(
      {
        name: "x",
        description: "",
        entries: [{ rule_type: "tag", tag_slug: "malware", country_codes: ["USA", "GB"] }],
      },
      ctx
    );
    const call = api.state.calls[0];
    if (call?.method !== "createPolicySet") throw new Error("wrong");
    expect(call.body.description).toBe("");
    expect(call.body.entries[0]?.country_codes).toEqual(["USA", "GB"]);
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
            entries: [TAG_ENTRY],
          },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
