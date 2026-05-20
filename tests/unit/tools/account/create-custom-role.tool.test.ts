import { describe, expect, it } from "vitest";

import { createCustomRoleTool } from "../../../../src/application/tools/account/create-custom-role.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createCustomRoleTool", () => {
  it("name + non-empty permissions required", () => {
    expect(createCustomRoleTool.name).toBe("create_custom_role");
    expect(() => createCustomRoleTool.inputSchema.parse({ name: "x", permissions: [] })).toThrow();
    expect(() => createCustomRoleTool.inputSchema.parse({ name: "" })).toThrow();
  });

  it("forwards body", async () => {
    const api = createFakeApiGateway();
    await createCustomRoleTool.handler(
      { name: "Auditor", permissions: ["scans.read", "alerts.read"] },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createCustomRole") throw new Error("wrong");
    expect(call.body).toEqual({ name: "Auditor", permissions: ["scans.read", "alerts.read"] });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createCustomRole = err(makeApiError("invalid-input", "x"));
    expect(
      (
        await createCustomRoleTool.handler(
          { name: "x", permissions: ["a"] },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });
});
