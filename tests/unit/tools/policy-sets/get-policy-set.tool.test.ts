import { describe, expect, it } from "vitest";

import { getPolicySetTool } from "../../../../src/application/tools/policy-sets/get-policy-set.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const PID = "00000000-0000-0000-0000-000000000eee";

describe("getPolicySetTool", () => {
  it("name + uuid", () => {
    expect(getPolicySetTool.name).toBe("get_policy_set");
    expect(() => getPolicySetTool.inputSchema.parse({ policy_set_id: "x" })).toThrow();
  });

  it("returns the set", async () => {
    const api = createFakeApiGateway();
    const r = await getPolicySetTool.handler({ policy_set_id: PID }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getPolicySet = err(makeApiError("not-found", "x"));
    expect(
      (await getPolicySetTool.handler({ policy_set_id: PID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
