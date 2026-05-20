import { describe, expect, it } from "vitest";

import { listCampaignsPickerTool } from "../../../../src/application/tools/campaigns/list-campaigns-picker.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const UUID_C = "00000000-0000-0000-0000-000000000ccc";
const UUID_G = "00000000-0000-0000-0000-000000000111";

describe("listCampaignsPickerTool", () => {
  it("name + read-only + idempotent", () => {
    expect(listCampaignsPickerTool.name).toBe("list_campaigns_picker");
    expect(listCampaignsPickerTool.annotations.readOnlyHint).toBe(true);
    expect(listCampaignsPickerTool.annotations.idempotentHint).toBe(true);
  });

  it("returns slim items from gateway", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCampaignsPicker = ok([
      { id: UUID_C, name: "Brand A", group_id: UUID_G, is_archived: false },
    ]);
    const r = await listCampaignsPickerTool.handler({}, makeToolContext({ api }));
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toHaveLength(1);
    expect(r._unsafeUnwrap()[0]?.name).toBe("Brand A");
  });

  it("records the call (no input filters) and forwards undefined", async () => {
    const api = createFakeApiGateway();
    await listCampaignsPickerTool.handler({}, makeToolContext({ api }));
    const call = api.state.calls[0];
    if (call?.method !== "listCampaignsPicker") throw new Error("wrong");
    expect(call.filters).toBeUndefined();
  });

  it("rejects invalid group_id uuid + out-of-range limit", () => {
    expect(() => listCampaignsPickerTool.inputSchema.parse({ group_id: "nope" })).toThrow();
    expect(() => listCampaignsPickerTool.inputSchema.parse({ limit: 501 })).toThrow();
    expect(() => listCampaignsPickerTool.inputSchema.parse({ limit: 0 })).toThrow();
  });

  it("forwards archived / group_id / q / limit filters", async () => {
    const api = createFakeApiGateway();
    await listCampaignsPickerTool.handler(
      { archived: true, group_id: UUID_G, q: "Brand", limit: 100 },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "listCampaignsPicker") throw new Error("wrong");
    expect(call.filters).toEqual({
      archived: true,
      group_id: UUID_G,
      q: "Brand",
      limit: 100,
    });
  });

  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.listCampaignsPicker = err(makeApiError("forbidden", "x"));
    expect((await listCampaignsPickerTool.handler({}, makeToolContext({ api }))).isErr()).toBe(
      true
    );
  });
});
