import { describe, expect, it } from "vitest";

import { listCustomRulesTool } from "../../../../src/application/tools/custom-rules/list-custom-rules.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listCustomRulesTool", () => {
  it("name + pagination defaults", () => {
    expect(listCustomRulesTool.name).toBe("list_custom_rules");
    expect(listCustomRulesTool.inputSchema.parse({}).page).toBe(1);
    expect(listCustomRulesTool.inputSchema.parse({}).limit).toBe(50);
  });

  it("returns page envelope", async () => {
    const api = createFakeApiGateway();
    const r = await listCustomRulesTool.handler({ page: 1, limit: 10 }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
  });

  // Regression for the v0.2.0 breaking change: agent-supplied
  // `page` / `limit` MUST flow through to the gateway so the API
  // returns the requested slice. Same pattern as
  // `list-policy-sets.tool.test.ts` and `list-run-scans.tool.test.ts`.
  it("forwards page/limit to gateway", async () => {
    const api = createFakeApiGateway();
    await listCustomRulesTool.handler({ page: 3, limit: 20 }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listCustomRules") throw new Error("wrong call recorded");
    expect(call.filters).toEqual({ page: 3, limit: 20 });
  });

  it("warns that a returned combo match_scope must be resent verbatim", () => {
    expect(listCustomRulesTool.description).toContain("may carry the rule-level key `match_scope`");
    expect(listCustomRulesTool.description).toContain("Resend it verbatim when updating");
    expect(listCustomRulesTool.description).toContain("reverts the rule to whole-scan matching");
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCustomRules = err(makeApiError("forbidden", "x"));
    expect(
      (await listCustomRulesTool.handler({ page: 1, limit: 10 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
