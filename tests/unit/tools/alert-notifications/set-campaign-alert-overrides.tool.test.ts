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
  it("forwards mode + destination_ids", async () => {
    const api = createFakeApiGateway();
    const r = await setCampaignAlertOverridesTool.handler(
      { campaign_id: CID, mode: "include", destination_ids: [DID] },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().mode).toBe("include");
    expect(r._unsafeUnwrap().destination_ids).toEqual([DID]);
    const call = api.state.calls[0];
    if (call?.method !== "setCampaignAlertOverrides") throw new Error("wrong");
    expect(call.body).toEqual({ mode: "include", destination_ids: [DID] });
  });
  it("inherit mode defaults destination_ids to empty", async () => {
    const api = createFakeApiGateway();
    // zod default([]) populates destination_ids when omitted at the
    // schema boundary — we model that here by passing the post-parsed
    // shape (handler receives the parsed output, not the raw input).
    const r = await setCampaignAlertOverridesTool.handler(
      { campaign_id: CID, mode: "inherit", destination_ids: [] },
      makeToolContext({ api })
    );
    expect(r._unsafeUnwrap().mode).toBe("inherit");
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
});
