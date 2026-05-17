import { describe, expect, it } from "vitest";

import { inviteUserTool } from "../../../../src/application/tools/account/invite-user.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const ROLE_ID = "00000000-0000-0000-0000-000000000033";

describe("inviteUserTool", () => {
  it("name + email validation", () => {
    expect(inviteUserTool.name).toBe("invite_user");
    expect(() =>
      inviteUserTool.inputSchema.parse({ email: "not-an-email", role_id: ROLE_ID })
    ).toThrow();
  });

  it("forwards email + role_id", async () => {
    const api = createFakeApiGateway();
    await inviteUserTool.handler(
      { email: "new@x.com", role_id: ROLE_ID },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "inviteUser") throw new Error("wrong");
    expect(call.body).toEqual({ email: "new@x.com", role_id: ROLE_ID });
  });

  it("forwards optional name when supplied", async () => {
    const api = createFakeApiGateway();
    await inviteUserTool.handler(
      { email: "new@x.com", role_id: ROLE_ID, name: "New User" },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "inviteUser") throw new Error("wrong");
    expect(call.body).toEqual({ email: "new@x.com", role_id: ROLE_ID, name: "New User" });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.inviteUser = err(makeApiError("invalid-input", "dup"));
    expect(
      (
        await inviteUserTool.handler(
          { email: "x@y.com", role_id: ROLE_ID },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
