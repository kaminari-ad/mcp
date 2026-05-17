import { describe, expect, it } from "vitest";

import { listApiKeysTool } from "../../../../src/application/tools/account/list-api-keys.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listApiKeysTool", () => {
  it("name", () => {
    expect(listApiKeysTool.name).toBe("list_api_keys");
  });

  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listApiKeys = ok([
      {
        id: "00000000-0000-0000-0000-000000000fff",
        key_prefix: "kad_abc1",
        name: "ci-key",
        expires_at: null,
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);
    const r = await listApiKeysTool.handler({}, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().total).toBe(1);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listApiKeys = err(makeApiError("forbidden", "x"));
    expect((await listApiKeysTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
