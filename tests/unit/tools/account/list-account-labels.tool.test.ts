import { describe, expect, it } from "vitest";

import { listAccountLabelsTool } from "../../../../src/application/tools/account/list-account-labels.tool.js";
import type { LabelDefinitionResponse } from "../../../../src/domain/ports/api-gateway.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

describe("listAccountLabelsTool", () => {
  it("name + read-only", () => {
    expect(listAccountLabelsTool.name).toBe("list_account_labels");
    expect(listAccountLabelsTool.annotations.readOnlyHint).toBe(true);
  });

  it("returns wrapped items array", async () => {
    const api = createFakeApiGateway();
    const labels: readonly LabelDefinitionResponse[] = [
      { key: "brand_safety", display_name: "Brand Safety", position: 0, auto_extract: true },
    ];
    api.state.responses.listAccountLabels = ok<readonly LabelDefinitionResponse[]>(labels);
    const r = await listAccountLabelsTool.handler({}, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().items).toEqual(labels);
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listAccountLabels = err(makeApiError("forbidden", "x"));
    expect((await listAccountLabelsTool.handler({}, makeToolContext({ api }))).isErr()).toBe(true);
  });
});
