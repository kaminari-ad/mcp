import { describe, expect, it } from "vitest";

import { getMeTool } from "../../../../src/application/tools/account/get-me.tool.js";
import { createFakeApiGateway, makeApiError, err } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getMeTool", () => {
  it("has the canonical name, description, and zero-field input schema", () => {
    expect(getMeTool.name).toBe("get_me");
    expect(getMeTool.description).toMatch(/authenticated user/);
    // Zero-field object schema.
    expect(Object.keys(getMeTool.inputSchema.shape)).toEqual([]);
  });

  it("returns the gateway's Me response on success", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });

    const result = await getMeTool.handler({}, ctx);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      user_id: "00000000-0000-0000-0000-000000000001",
      organization_id: "00000000-0000-0000-0000-000000000010",
      email: "test@example.com",
      display_name: "Test User",
      permissions: [],
    });
    expect(api.state.calls).toEqual([{ method: "getMe" }]);
  });

  it("maps an unauthorized ApiError to a ToolError with the same kind", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getMe = err(makeApiError("unauthorized", "Token expired"));
    const ctx = makeToolContext({ api });

    const result = await getMeTool.handler({}, ctx);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({
      kind: "unauthorized",
      message: "Token expired",
    });
  });

  it("maps an upstream ApiError into a ToolError with kind=upstream", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getMe = err({
      kind: "upstream",
      detail: "ECONNRESET",
      status: 502,
    });
    const ctx = makeToolContext({ api });

    const result = await getMeTool.handler({}, ctx);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({
      kind: "upstream",
      message: "ECONNRESET",
      status: 502,
    });
  });
});
