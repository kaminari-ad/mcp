import { describe, expect, it } from "vitest";

import { listCustomRulesTool } from "../../../../src/application/tools/custom-rules/list-custom-rules.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listCustomRulesTool", () => {
  it("name + defaults", () => {
    expect(listCustomRulesTool.name).toBe("list_custom_rules");
    expect(listCustomRulesTool.inputSchema.parse({}).page).toBe(1);
  });

  it("returns page envelope", async () => {
    const api = createFakeApiGateway();
    const r = await listCustomRulesTool.handler({ page: 1, limit: 10 }, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCustomRules = err(makeApiError("forbidden", "x"));
    expect(
      (await listCustomRulesTool.handler({ page: 1, limit: 10 }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
