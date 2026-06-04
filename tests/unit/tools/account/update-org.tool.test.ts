import { describe, expect, it } from "vitest";

import { updateOrgTool } from "../../../../src/application/tools/account/update-org.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("updateOrgTool", () => {
  it("name + annotations", () => {
    expect(updateOrgTool.name).toBe("update_org");
    expect(updateOrgTool.annotations.readOnlyHint).toBe(false);
  });
  it("forwards only supplied fields", async () => {
    const api = createFakeApiGateway();
    await updateOrgTool.handler({ name: "New" }, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "updateOrg") throw new Error("wrong");
    expect(call.body).toEqual({ name: "New" });
  });
  it("drops an unknown settings field at validation (no longer supported)", () => {
    const parsed = updateOrgTool.inputSchema.parse({ name: "x", settings: { theme: "dark" } });
    expect(parsed).toEqual({ name: "x" });
    expect("settings" in parsed).toBe(false);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateOrg = err(makeApiError("forbidden", "x"));
    expect((await updateOrgTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
