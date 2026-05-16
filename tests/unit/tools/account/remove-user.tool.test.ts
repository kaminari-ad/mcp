import { describe, expect, it } from "vitest";

import { removeUserTool } from "../../../../src/application/tools/account/remove-user.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const UID = "00000000-0000-0000-0000-000000000001";

describe("removeUserTool", () => {
  it("destructive annotation", () => {
    expect(removeUserTool.name).toBe("remove_user");
    expect(removeUserTool.annotations.destructiveHint).toBe(true);
  });
  it("returns removed=true and forwards the user id", async () => {
    const api = createFakeApiGateway();
    const r = await removeUserTool.handler({ user_id: UID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({ removed: true });
    expect(api.state.calls[0]).toEqual({ method: "removeUser", userId: UID });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.removeUser = err(makeApiError("forbidden", "owner"));
    expect((await removeUserTool.handler({ user_id: UID }, makeToolContext({ api }))).isErr()).toBe(
      true
    );
  });
});
