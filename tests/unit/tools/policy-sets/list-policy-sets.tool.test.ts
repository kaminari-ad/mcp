import { describe, expect, it } from "vitest";

import { listPolicySetsTool } from "../../../../src/application/tools/policy-sets/list-policy-sets.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listPolicySetsTool", () => {
  it("name", () => {
    expect(listPolicySetsTool.name).toBe("list_policy_sets");
  });

  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listPolicySets = ok([
      {
        id: "00000000-0000-0000-0000-000000000eee",
        organization_id: "00000000-0000-0000-0000-000000000010",
        name: "x",
        description: "",
        visibility: "private",
        is_approved: true,
        entries: [],
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);
    const r = await listPolicySetsTool.handler({}, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().total).toBe(1);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listPolicySets = err(makeApiError("forbidden", "x"));
    expect((await listPolicySetsTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
