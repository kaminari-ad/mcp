import { describe, expect, it } from "vitest";

import { listOrgUsersTool } from "../../../../src/application/tools/account/list-org-users.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listOrgUsersTool", () => {
  it("name + read-only annotation", () => {
    expect(listOrgUsersTool.name).toBe("list_org_users");
    expect(listOrgUsersTool.annotations.readOnlyHint).toBe(true);
  });
  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listOrgUsers = ok([
      {
        id: "00000000-0000-0000-0000-000000000001",
        email: "a@b",
        display_name: "A",
        role: "admin",
        is_owner: false,
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);
    const r = await listOrgUsersTool.handler({}, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().total).toBe(1);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listOrgUsers = err(makeApiError("forbidden", "x"));
    expect((await listOrgUsersTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
