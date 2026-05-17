import { describe, expect, it } from "vitest";

import { listEmulatorsTool } from "../../../../src/application/tools/emulators/list-emulators.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listEmulatorsTool", () => {
  it("name", () => {
    expect(listEmulatorsTool.name).toBe("list_emulators");
  });

  it("returns items + total", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listEmulators = ok([
      { id: "default", display_name: "Default", category: "desktop", browser: "chrome" },
    ]);
    const r = await listEmulatorsTool.handler({}, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().total).toBe(1);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listEmulators = err(makeApiError("forbidden", "x"));
    expect((await listEmulatorsTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
