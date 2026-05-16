import { describe, expect, it } from "vitest";

import { revokeApiKeyTool } from "../../../../src/application/tools/account/revoke-api-key.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const KID = "00000000-0000-0000-0000-000000000fff";

describe("revokeApiKeyTool", () => {
  it("destructive annotation", () => {
    expect(revokeApiKeyTool.name).toBe("revoke_api_key");
    expect(revokeApiKeyTool.annotations.destructiveHint).toBe(true);
  });
  it("returns revoked=true and forwards the key id", async () => {
    const api = createFakeApiGateway();
    const r = await revokeApiKeyTool.handler({ key_id: KID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({ revoked: true });
    expect(api.state.calls[0]).toEqual({ method: "revokeApiKey", id: KID });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.revokeApiKey = err(makeApiError("not-found", "x"));
    expect(
      (await revokeApiKeyTool.handler({ key_id: KID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
