import { describe, expect, it } from "vitest";

import { updateAccountLabelsTool } from "../../../../src/application/tools/account/update-account-labels.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("updateAccountLabelsTool", () => {
  it("name + idempotent", () => {
    expect(updateAccountLabelsTool.name).toBe("update_account_labels");
    expect(updateAccountLabelsTool.annotations.idempotentHint).toBe(true);
  });

  it("forwards labels and defaults auto_extract to false", async () => {
    const api = createFakeApiGateway();
    await updateAccountLabelsTool.handler(
      {
        labels: [
          { key: "brand_safety", display_name: "Brand Safety", auto_extract: true },
          { key: "vertical", display_name: "Vertical" },
        ],
      },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateAccountLabels") throw new Error("wrong");
    expect(call.body.labels).toEqual([
      { key: "brand_safety", display_name: "Brand Safety", auto_extract: true },
      { key: "vertical", display_name: "Vertical", auto_extract: false },
    ]);
  });

  it("rejects non-snake_case keys", () => {
    expect(() =>
      updateAccountLabelsTool.inputSchema.parse({
        labels: [{ key: "Brand-Safety", display_name: "x" }],
      })
    ).toThrow();
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateAccountLabels = err(makeApiError("forbidden", "x"));
    expect(
      (await updateAccountLabelsTool.handler({ labels: [] }, makeToolContext({ api }))).isErr()
    ).toBe(true);
  });
});
