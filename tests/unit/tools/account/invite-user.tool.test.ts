import { describe, expect, it } from "vitest";

import { inviteUserTool } from "../../../../src/application/tools/account/invite-user.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("inviteUserTool", () => {
  it("name + email validation", () => {
    expect(inviteUserTool.name).toBe("invite_user");
    expect(() => inviteUserTool.inputSchema.parse({ email: "not-an-email", role: "admin" })).toThrow();
  });
  it("forwards email + role", async () => {
    const api = createFakeApiGateway();
    await inviteUserTool.handler(
      { email: "new@x.com", role: "viewer" },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "inviteUser") throw new Error("wrong");
    expect(call.body).toEqual({ email: "new@x.com", role: "viewer" });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.inviteUser = err(makeApiError("invalid-input", "dup"));
    expect(
      (await inviteUserTool.handler({ email: "x@y.com", role: "admin" }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
