import { describe, expect, it } from "vitest";

import { transferOwnershipTool } from "../../../../src/application/tools/account/transfer-ownership.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const UID = "00000000-0000-0000-0000-000000000001";

describe("transferOwnershipTool", () => {
  it("destructive non-idempotent", () => {
    expect(transferOwnershipTool.name).toBe("transfer_ownership");
    expect(transferOwnershipTool.annotations.destructiveHint).toBe(true);
    expect(transferOwnershipTool.annotations.idempotentHint).toBe(false);
  });
  it("returns transferred=true and forwards the user id", async () => {
    const api = createFakeApiGateway();
    const r = await transferOwnershipTool.handler({ user_id: UID }, makeToolContext({ api }));
    expect(r._unsafeUnwrap()).toEqual({ transferred: true });
    expect(api.state.calls[0]).toEqual({ method: "transferOwnership", userId: UID });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.transferOwnership = err(makeApiError("forbidden", "x"));
    expect(
      (await transferOwnershipTool.handler({ user_id: UID }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
