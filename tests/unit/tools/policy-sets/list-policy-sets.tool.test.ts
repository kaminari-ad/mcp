import { describe, expect, it } from "vitest";

import { listPolicySetsTool } from "../../../../src/application/tools/policy-sets/list-policy-sets.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listPolicySetsTool", () => {
  it("name + pagination defaults", () => {
    expect(listPolicySetsTool.name).toBe("list_policy_sets");
    expect(listPolicySetsTool.inputSchema.parse({}).page).toBe(1);
    expect(listPolicySetsTool.inputSchema.parse({}).limit).toBe(50);
  });

  it("returns paginated envelope (slim items, no `entries`)", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listPolicySets = ok({
      items: [
        {
          id: "00000000-0000-0000-0000-000000000eee",
          organization_id: "00000000-0000-0000-0000-000000000010",
          name: "x",
          description: "",
          visibility: "private",
          is_approved: true,
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      total: 67,
      page: 1,
      limit: 50,
    });
    const r = await listPolicySetsTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    const v = r._unsafeUnwrap();
    expect(v.items[0]?.name).toBe("x");
    expect(v.total).toBe(67);
    expect(v.page).toBe(1);
  });

  it("forwards page/limit to gateway", async () => {
    const api = createFakeApiGateway();
    await listPolicySetsTool.handler({ page: 3, limit: 20 }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listPolicySets") throw new Error("wrong call recorded");
    expect(call.filters).toEqual({ page: 3, limit: 20 });
  });

  it("forwards visibility filter when supplied", async () => {
    const api = createFakeApiGateway();
    await listPolicySetsTool.handler(
      { page: 1, limit: 50, visibility: "public" },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listPolicySets") throw new Error("wrong call");
    expect(call.filters.visibility).toBe("public");
  });

  it("rejects unknown visibility values (e.g. 'all' is NOT on the API)", () => {
    // The API enum is { private, public }; passing 'all' would 422.
    // Agents that want both scopes must omit the filter entirely.
    expect(() =>
      listPolicySetsTool.inputSchema.parse({ page: 1, limit: 50, visibility: "all" })
    ).toThrow();
    expect(() =>
      listPolicySetsTool.inputSchema.parse({ page: 1, limit: 50, visibility: "weird" })
    ).toThrow();
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listPolicySets = err(makeApiError("forbidden", "x"));
    expect(
      (await listPolicySetsTool.handler({ page: 1, limit: 50 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
