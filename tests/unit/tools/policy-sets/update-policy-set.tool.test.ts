import { describe, expect, it } from "vitest";

import { updatePolicySetTool } from "../../../../src/application/tools/policy-sets/update-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";

describe("updatePolicySetTool", () => {
  it("name + uuid + name/description/entries required", () => {
    expect(updatePolicySetTool.name).toBe("update_policy_set");
    expect(() =>
      updatePolicySetTool.inputSchema.parse({
        policy_set_id: "not-a-uuid",
        name: "x",
        description: "",
        entries: [{ tag_slug: "y", country_codes: [] }],
      })
    ).toThrow();
    expect(() => updatePolicySetTool.inputSchema.parse({ policy_set_id: PID })).toThrow();
  });

  it("forwards full replacement body", async () => {
    const api = createFakeApiGateway();
    await updatePolicySetTool.handler(
      {
        policy_set_id: PID,
        name: "rn",
        description: "updated",
        entries: [{ tag_slug: "x", country_codes: ["US"] }],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updatePolicySet") throw new Error("wrong");
    expect(call.id).toBe(PID);
    expect(call.body.name).toBe("rn");
    expect(call.body.description).toBe("updated");
    expect(call.body.entries[0]?.tag_slug).toBe("x");
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
            entries: [{ tag_slug: "y", country_codes: [] }],
          },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
