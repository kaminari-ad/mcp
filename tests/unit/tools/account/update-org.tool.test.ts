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
  it("forwards both fields when supplied", async () => {
    const api = createFakeApiGateway();
    await updateOrgTool.handler(
      { name: "x", settings: { theme: "dark" } },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "updateOrg") throw new Error("wrong");
    expect(call.body).toEqual({ name: "x", settings: { theme: "dark" } });
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.updateOrg = err(makeApiError("forbidden", "x"));
    expect((await updateOrgTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
