import { describe, expect, it } from "vitest";

import { updateUserRoleTool } from "../../../../src/application/tools/account/update-user-role.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const UID = "00000000-0000-0000-0000-000000000001";
const ROLE_ID = "00000000-0000-0000-0000-000000000033";

describe("updateUserRoleTool", () => {
  it("name + uuid + idempotent annotation", () => {
    expect(updateUserRoleTool.name).toBe("update_user_role");
    expect(updateUserRoleTool.annotations.idempotentHint).toBe(true);
    expect(() => updateUserRoleTool.inputSchema.parse({ user_id: "x", role_id: "y" })).toThrow();
  });
  it("forwards role change", async () => {
    const api = createFakeApiGateway();
    await updateUserRoleTool.handler({ user_id: UID, role_id: ROLE_ID }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "updateUserRole") throw new Error("wrong");
    expect(call.userId).toBe(UID);
    expect(call.body.role_id).toBe(ROLE_ID);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateUserRole = err(makeApiError("not-found", "x"));
    expect(
      (
        await updateUserRoleTool.handler(
          { user_id: UID, role_id: ROLE_ID },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
