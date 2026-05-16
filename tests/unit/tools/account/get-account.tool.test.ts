import { describe, expect, it } from "vitest";

import { getAccountTool } from "../../../../src/application/tools/account/get-account.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("getAccountTool", () => {
  it("has the canonical name, description, and zero-field input schema", () => {
    expect(getAccountTool.name).toBe("get_account");
    expect(getAccountTool.description).toMatch(/organization/);
    expect(Object.keys(getAccountTool.inputSchema.shape)).toEqual([]);
  });

  it("returns the gateway's OrgResponse on success", async () => {
    const api = createFakeApiGateway();
    const ctx = makeToolContext({ api });

    const result = await getAccountTool.handler({}, ctx);
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      id: "00000000-0000-0000-0000-000000000010",
      name: "Test Org",
      owner_id: "00000000-0000-0000-0000-000000000001",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    });
    expect(api.state.calls).toEqual([{ method: "getAccount" }]);
  });

  it("maps an unauthorized ApiError to a ToolError with the same kind", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getAccount = err(makeApiError("unauthorized", "Token expired"));
    const ctx = makeToolContext({ api });

    const result = await getAccountTool.handler({}, ctx);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({
      kind: "unauthorized",
      message: "Token expired",
    });
  });

  it("maps an upstream ApiError into a ToolError with kind=upstream", async () => {
    const api = createFakeApiGateway();
    api.state.responses.getAccount = err({
      kind: "upstream",
      detail: "ECONNRESET",
      status: 502,
    });
    const ctx = makeToolContext({ api });

    const result = await getAccountTool.handler({}, ctx);
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual({
      kind: "upstream",
      message: "ECONNRESET",
      status: 502,
    });
  });
});
