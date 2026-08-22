import { describe, expect, it } from "vitest";

import { setCampaignAlertOverridesTool } from "../../../../src/application/tools/alert-notifications/set-campaign-alert-overrides.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const CID = "00000000-0000-0000-0000-000000000ccc";
const DID = "00000000-0000-0000-0000-000000000999";

describe("setCampaignAlertOverridesTool", () => {
  it("idempotent", () => {
    expect(setCampaignAlertOverridesTool.name).toBe("set_campaign_alert_overrides");
    expect(setCampaignAlertOverridesTool.annotations.idempotentHint).toBe(true);
  });
  it("forwards mode + destination_ids and returns { updated: true } on 204", async () => {
    const api = createFakeApiGateway();
    const r = await setCampaignAlertOverridesTool.handler(
      { campaign_id: CID, mode: "override", destination_ids: [DID] },
      makeToolContext({ api })
    );
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap()).toEqual({ updated: true });
    const call = api.state.calls[0];
    if (call?.method !== "setCampaignAlertOverrides") throw new Error("wrong");
    expect(call.campaignId).toBe(CID);
    expect(call.body).toEqual({ mode: "override", destination_ids: [DID] });
  });
  it("inherit mode forwards empty destination_ids", async () => {
    const api = createFakeApiGateway();
    await setCampaignAlertOverridesTool.handler(
      { campaign_id: CID, mode: "inherit", destination_ids: [] },
      makeToolContext({ api })
    );
    const call = api.state.calls[0];
    if (call?.method !== "setCampaignAlertOverrides") throw new Error("wrong");
    expect(call.body.mode).toBe("inherit");
    expect(call.body.destination_ids).toEqual([]);
  });
  it("maps error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.setCampaignAlertOverrides = err(makeApiError("not-found", "x"));
    expect(
      (
        await setCampaignAlertOverridesTool.handler(
          { campaign_id: CID, mode: "inherit", destination_ids: [] },
          makeToolContext({ api })
        )
      ).isErr()
    ).toBe(true);
  });

  // KAMIAD-158: the schema advertised include/exclude, which the API
  // has never accepted, so the agent inside the cabinet could not set
  // campaign alert routing at all. Guard both directions.
  describe("mode enum matches the API", () => {
    it.each(["inherit", "override", "silence"])("accepts %s", (mode) => {
      const parsed = setCampaignAlertOverridesTool.inputSchema.safeParse({
        campaign_id: CID,
        mode,
        destination_ids: [],
      });
      expect(parsed.success).toBe(true);
    });

    it.each(["include", "exclude", "mute", ""])("rejects %s", (mode) => {
      const parsed = setCampaignAlertOverridesTool.inputSchema.safeParse({
        campaign_id: CID,
        mode,
        destination_ids: [],
      });
      expect(parsed.success).toBe(false);
    });
  });

  // The API answers 422 `notifications.invalid_override_combination`;
  // the handler refuses first so the agent gets an actionable message
  // without spending a round trip.
  describe("destination_ids is only valid with override", () => {
    it.each(["inherit", "silence"] as const)("rejects destinations alongside %s", async (mode) => {
      const api = createFakeApiGateway();
      const r = await setCampaignAlertOverridesTool.handler(
        { campaign_id: CID, mode, destination_ids: [DID] },
        makeToolContext({ api })
      );
      expect(r.isErr()).toBe(true);
      expect(r._unsafeUnwrapErr().kind).toBe("invalid-input");
      expect(api.state.calls).toHaveLength(0);
    });

    it("allows override with an empty list", async () => {
      const api = createFakeApiGateway();
      const r = await setCampaignAlertOverridesTool.handler(
        { campaign_id: CID, mode: "override", destination_ids: [] },
        makeToolContext({ api })
      );
      expect(r.isOk()).toBe(true);
    });
  });
});
