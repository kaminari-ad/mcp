import { describe, expect, it } from "vitest";

import { updatePolicySetTool } from "../../../../src/application/tools/policy-sets/update-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";
const TAG_ENTRY = { rule_type: "tag" as const, tag_slug: "x", country_codes: ["US"] };

describe("updatePolicySetTool", () => {
  it("name + uuid + name/description/entries required", () => {
    expect(updatePolicySetTool.name).toBe("update_policy_set");
    expect(() =>
      updatePolicySetTool.inputSchema.parse({
        policy_set_id: "not-a-uuid",
        name: "x",
        description: "",
        entries: [TAG_ENTRY],
      })
    ).toThrow();
    expect(() => updatePolicySetTool.inputSchema.parse({ policy_set_id: PID })).toThrow();
  });

  it("rejects entry without rule_type discriminator", () => {
    expect(() =>
      updatePolicySetTool.inputSchema.parse({
        policy_set_id: PID,
        name: "x",
        description: "",
        entries: [{ tag_slug: "y", country_codes: [] }],
      })
    ).toThrow();
  });

  it("rejects each rule kind with its value-block missing", () => {
    for (const kind of ["iab_v3", "brand", "ai_category", "custom_taxonomy"] as const) {
      expect(() =>
        updatePolicySetTool.inputSchema.parse({
          policy_set_id: PID,
          name: "x",
          description: "",
          entries: [{ rule_type: kind, country_codes: [] }],
        })
      ).toThrow();
    }
  });

  it("forwards full replacement body for tag rule", async () => {
    const api = createFakeApiGateway();
    await updatePolicySetTool.handler(
      {
        policy_set_id: PID,
        name: "rn",
        description: "updated",
        entries: [TAG_ENTRY],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updatePolicySet") throw new Error("wrong");
    expect(call.id).toBe(PID);
    expect(call.body.name).toBe("rn");
    expect(call.body.description).toBe("updated");
    expect(call.body.entries[0]?.rule_type).toBe("tag");
    expect(call.body.entries[0]?.tag_slug).toBe("x");
  });

  it("forwards ai_category rule body", async () => {
    const api = createFakeApiGateway();
    await updatePolicySetTool.handler(
      {
        policy_set_id: PID,
        name: "n",
        description: "",
        entries: [
          {
            rule_type: "ai_category",
            ai_category: { tier1: "Gambling", tier2: "Online Casinos" },
            country_codes: [],
          },
        ],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updatePolicySet") throw new Error("wrong");
    expect(call.body.entries[0]?.rule_type).toBe("ai_category");
    expect(call.body.entries[0]?.ai_category).toEqual({
      tier1: "Gambling",
      tier2: "Online Casinos",
      tier3: null,
      tier4: null,
    });
  });

  it("forwards custom_taxonomy rule body", async () => {
    const api = createFakeApiGateway();
    await updatePolicySetTool.handler(
      {
        policy_set_id: PID,
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
    if (call?.method !== "updatePolicySet") throw new Error("wrong");
    expect(call.body.entries[0]?.custom_taxonomy?.taxonomy_id).toBe(
      "00000000-0000-0000-0000-0000000000aa"
    );
  });

  it("forwards mixed-kind replacement body", async () => {
    const api = createFakeApiGateway();
    await updatePolicySetTool.handler(
      {
        policy_set_id: PID,
        name: "n",
        description: "",
        entries: [
          TAG_ENTRY,
          {
            rule_type: "iab_v3",
            iab_v3: { tier1: "Sensitive Topics" },
            country_codes: [],
          },
          { rule_type: "brand", brand: "Acme", country_codes: [] },
        ],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updatePolicySet") throw new Error("wrong");
    expect(call.body.entries.map((e) => e.rule_type)).toEqual(["tag", "iab_v3", "brand"]);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updatePolicySet = err(makeApiError("not-found", "x"));
    expect(
      (
        await updatePolicySetTool.handler(
          {
            policy_set_id: PID,
            name: "rn",
            description: "",
            entries: [TAG_ENTRY],
          },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
