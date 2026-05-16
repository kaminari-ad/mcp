import { describe, expect, it } from "vitest";

import { createApiKeyTool } from "../../../../src/application/tools/account/create-api-key.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("createApiKeyTool", () => {
  it("name + non-idempotent annotation", () => {
    expect(createApiKeyTool.name).toBe("create_api_key");
    expect(createApiKeyTool.annotations.idempotentHint).toBe(false);
  });
  it("returns full_key in response", async () => {
    const api = createFakeApiGateway();
    const r = await createApiKeyTool.handler({ name: "ci" }, makeToolContext({ api }));
    expect(r._unsafeUnwrap().full_key).toBeDefined();
  });
  it("forwards expires_at when supplied", async () => {
    const api = createFakeApiGateway();
    await createApiKeyTool.handler(
      { name: "ci", expires_at: "2027-01-01T00:00:00Z" },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "createApiKey") throw new Error("wrong");
    expect(call.body.expires_at).toBe("2027-01-01T00:00:00Z");
  });
  it("omits expires_at when undefined", async () => {
    const api = createFakeApiGateway();
    await createApiKeyTool.handler({ name: "ci" }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "createApiKey") throw new Error("wrong");
    expect(call.body.expires_at).toBeUndefined();
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.createApiKey = err(makeApiError("forbidden", "x"));
    expect((await createApiKeyTool.handler({ name: "ci" }, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
