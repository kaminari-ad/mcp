import { describe, expect, it } from "vitest";

import { listOrgRolesTool } from "../../../../src/application/tools/account/list-org-roles.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listOrgRolesTool", () => {
  it("name + read-only", () => {
    expect(listOrgRolesTool.name).toBe("list_org_roles");
    expect(listOrgRolesTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listOrgRoles = ok([
      { id: "r1", name: "admin", is_system: true, permissions: ["*"] },
    ]);
    const r = await listOrgRolesTool.handler({}, makeToolContext({ api }));
    expect(r._unsafeUnwrap().total).toBe(1);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listOrgRoles = err(makeApiError("forbidden", "x"));
    expect((await listOrgRolesTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
